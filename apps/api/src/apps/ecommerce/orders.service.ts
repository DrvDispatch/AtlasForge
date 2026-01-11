import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrderDto, UpdateOrderStatusDto, OrderResponseDto } from './dto';
import { CartService } from './cart.service';

/**
 * Order State Machine: Defines allowed status transitions
 * Terminal states: CANCELLED, REFUNDED (cannot transition out)
 */
const ORDER_STATE_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'COMPLETED', 'CANCELLED'],
    SHIPPED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: ['REFUNDED'],
    CANCELLED: [], // Terminal
    REFUNDED: [],  // Terminal
};

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    // ===========================================
    // PUBLIC: Create Order from Cart
    // ===========================================

    /**
     * Create order from current cart
     */
    async createFromCart(
        tenantId: string,
        userId: string | undefined,
        sessionId: string | undefined,
        dto: CreateOrderDto,
    ): Promise<OrderResponseDto> {
        // Get cart
        const cart = await this.prisma.cart.findFirst({
            where: {
                tenantId,
                ...(userId ? { userId } : { sessionId }),
            },
            include: {
                items: {
                    include: {
                        offering: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new ConflictException('Cart is empty');
        }

        // Calculate totals
        const subtotalCents = cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
        const totalCents = subtotalCents; // TODO: Add shipping, tax, discounts

        // Generate order number
        const orderNumber = await this.generateOrderNumber(tenantId);

        // Create order with items in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    tenantId,
                    userId,
                    orderNumber,
                    status: 'PENDING',
                    subtotalCents,
                    totalCents,
                    currency: 'EUR', // TODO: From tenant config
                    customerEmail: dto.customerEmail,
                    customerName: dto.customerName,
                    customerPhone: dto.customerPhone,
                    shippingAddress: dto.shippingAddress as any,
                    billingAddress: dto.billingAddress || dto.shippingAddress as any,
                    customerNotes: dto.customerNotes,
                    items: {
                        create: cart.items.map(item => ({
                            offeringId: item.offeringId,
                            offeringName: item.offering.name,
                            offeringSlug: item.offering.slug,
                            offeringImage: item.offering.image,
                            quantity: item.quantity,
                            priceCents: item.priceCents,
                            totalCents: item.priceCents * item.quantity,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            // Clear cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            await tx.cart.delete({ where: { id: cart.id } });

            return newOrder;
        });

        this.eventEmitter.emit('order.created', { order, tenantId });
        this.logger.log(`Order ${orderNumber} created for tenant ${tenantId}`);

        return this.formatOrderResponse(order);
    }

    /**
     * Get order by order number (public - for order tracking)
     */
    async getByOrderNumber(tenantId: string, orderNumber: string, email: string): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: {
                tenantId,
                orderNumber,
                customerEmail: email.toLowerCase(),
            },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return this.formatOrderResponse(order);
    }

    /**
     * Get orders for authenticated user
     */
    async getMyOrders(tenantId: string, userId: string): Promise<OrderResponseDto[]> {
        const orders = await this.prisma.order.findMany({
            where: { tenantId, userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });

        return orders.map(o => this.formatOrderResponse(o));
    }

    // ===========================================
    // ADMIN: Order Management
    // ===========================================

    /**
     * List all orders (admin)
     */
    async findAll(tenantId: string, status?: string): Promise<OrderResponseDto[]> {
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(status ? { status: status as any } : {}),
            },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });

        return orders.map(o => this.formatOrderResponse(o));
    }

    /**
     * Get order by ID (admin)
     */
    async findOne(tenantId: string, id: string): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { tenantId, id },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return this.formatOrderResponse(order);
    }

    /**
     * Update order status (admin)
     * Validates state transitions and logs to audit
     */
    async updateStatus(
        tenantId: string,
        id: string,
        dto: UpdateOrderStatusDto,
        adminUserId?: string,
        adminUserName?: string,
    ): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { tenantId, id },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const previousStatus = order.status;
        const newStatus = dto.status;

        // Validate state transition
        this.validateStatusTransition(previousStatus, newStatus);

        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: newStatus,
                adminNotes: dto.adminNotes,
                ...(newStatus === 'PAID' ? { paidAt: new Date() } : {}),
                ...(newStatus === 'SHIPPED' ? { shippedAt: new Date() } : {}),
                ...(newStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
            },
            include: { items: true },
        });

        // Audit log
        await this.logAudit({
            tenantId,
            userId: adminUserId || 'system',
            userName: adminUserName || 'System',
            action: 'STATUS_CHANGE',
            entityType: 'Order',
            entityId: order.id,
            entityName: order.orderNumber,
            description: `Order status changed from ${previousStatus} to ${newStatus}`,
            oldValue: { status: previousStatus },
            newValue: { status: newStatus, adminNotes: dto.adminNotes },
        });

        this.eventEmitter.emit('order.status_changed', {
            order: updated,
            previousStatus,
            newStatus,
            tenantId,
        });

        this.logger.log(`Order ${order.orderNumber} status: ${previousStatus} → ${newStatus}`);

        return this.formatOrderResponse(updated);
    }

    /**
     * Validate order status transition against state machine
     */
    private validateStatusTransition(currentStatus: string, newStatus: string): void {
        if (currentStatus === newStatus) {
            return; // No change is always valid
        }

        const allowedTransitions = ORDER_STATE_TRANSITIONS[currentStatus] || [];
        if (!allowedTransitions.includes(newStatus)) {
            throw new ConflictException(
                `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
                `Allowed: ${allowedTransitions.join(', ') || 'none (terminal state)'}`
            );
        }
    }

    /**
     * Log action to audit table
     */
    private async logAudit(data: {
        tenantId: string;
        userId: string;
        userName: string;
        action: string;
        entityType: string;
        entityId: string;
        entityName: string;
        description: string;
        oldValue?: any;
        newValue?: any;
    }): Promise<void> {
        try {
            await this.prisma.auditLog.create({
                data: {
                    tenantId: data.tenantId,
                    userId: data.userId,
                    userName: data.userName,
                    userRole: 'ADMIN',
                    action: data.action as any,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    entityName: data.entityName,
                    description: data.description,
                    oldValue: data.oldValue,
                    newValue: data.newValue,
                },
            });
        } catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }

    // ===========================================
    // HELPERS
    // ===========================================

    private async generateOrderNumber(tenantId: string): Promise<string> {
        // Format: AF-YYYYMMDD-XXXX
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

        // Count orders today for this tenant
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const count = await this.prisma.order.count({
            where: {
                tenantId,
                createdAt: { gte: startOfDay },
            },
        });

        const sequence = String(count + 1).padStart(4, '0');
        return `AF-${dateStr}-${sequence}`;
    }

    private formatOrderResponse(order: any): OrderResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: (order.items || []).map((item: any) => ({
                id: item.id,
                offeringId: item.offeringId,
                offeringName: item.offeringName,
                offeringSlug: item.offeringSlug,
                offeringImage: item.offeringImage,
                quantity: item.quantity,
                priceCents: item.priceCents,
                totalCents: item.totalCents,
            })),
            subtotalCents: order.subtotalCents,
            discountCents: order.discountCents,
            shippingCents: order.shippingCents,
            taxCents: order.taxCents,
            totalCents: order.totalCents,
            currency: order.currency,
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            createdAt: order.createdAt,
            paidAt: order.paidAt,
            completedAt: order.completedAt,
        };
    }
}
