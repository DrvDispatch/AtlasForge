import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CartResponseDto, CartItemResponseDto } from './dto';

@Injectable()
export class CartService {
    private readonly logger = new Logger(CartService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ===========================================
    // PUBLIC: Cart Operations
    // ===========================================

    /**
     * Get or create cart for user
     */
    async getOrCreateCart(tenantId: string, userId?: string, sessionId?: string): Promise<CartResponseDto> {
        if (!userId && !sessionId) {
            throw new ConflictException('User ID or session ID required');
        }

        let cart = await this.prisma.cart.findFirst({
            where: {
                tenantId,
                ...(userId ? { userId } : { sessionId }),
            },
            include: {
                items: {
                    include: {
                        offering: {
                            select: { id: true, name: true, slug: true, image: true, priceCents: true },
                        },
                    },
                },
            },
        });

        if (!cart) {
            // Create new cart (expires in 30 days)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            cart = await this.prisma.cart.create({
                data: {
                    tenantId,
                    userId: userId || undefined,
                    sessionId: sessionId || undefined,
                    expiresAt,
                },
                include: {
                    items: {
                        include: {
                            offering: {
                                select: { id: true, name: true, slug: true, image: true, priceCents: true },
                            },
                        },
                    },
                },
            });
        }

        return this.formatCartResponse(cart);
    }

    /**
     * Add item to cart
     */
    async addItem(tenantId: string, userId: string | undefined, sessionId: string | undefined, dto: AddToCartDto): Promise<CartResponseDto> {
        const cart = await this.getOrCreateCartEntity(tenantId, userId, sessionId);

        // Find the offering
        const offering = await this.prisma.offering.findFirst({
            where: { id: dto.offeringId, tenantId, isActive: true },
        });

        if (!offering) {
            throw new NotFoundException('Offering not found');
        }

        if (offering.priceCents === null) {
            throw new ConflictException('This offering requires a quote and cannot be added to cart');
        }

        // Check if item already in cart
        const existingItem = await this.prisma.cartItem.findUnique({
            where: { cartId_offeringId: { cartId: cart.id, offeringId: dto.offeringId } },
        });

        if (existingItem) {
            // Update quantity
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (dto.quantity || 1) },
            });
        } else {
            // Add new item
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    offeringId: dto.offeringId,
                    quantity: dto.quantity || 1,
                    priceCents: offering.priceCents,
                },
            });
        }

        // Refresh and return cart
        return this.getCart(tenantId, userId, sessionId);
    }

    /**
     * Update cart item quantity
     */
    async updateItem(tenantId: string, userId: string | undefined, sessionId: string | undefined, itemId: string, dto: UpdateCartItemDto): Promise<CartResponseDto> {
        const cart = await this.getCartEntity(tenantId, userId, sessionId);
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });

        if (!item) {
            throw new NotFoundException('Item not found in cart');
        }

        if (dto.quantity === 0) {
            // Remove item
            await this.prisma.cartItem.delete({ where: { id: itemId } });
        } else {
            // Update quantity
            await this.prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity: dto.quantity },
            });
        }

        return this.getCart(tenantId, userId, sessionId);
    }

    /**
     * Remove item from cart
     */
    async removeItem(tenantId: string, userId: string | undefined, sessionId: string | undefined, itemId: string): Promise<CartResponseDto> {
        const cart = await this.getCartEntity(tenantId, userId, sessionId);
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });

        if (!item) {
            throw new NotFoundException('Item not found in cart');
        }

        await this.prisma.cartItem.delete({ where: { id: itemId } });
        return this.getCart(tenantId, userId, sessionId);
    }

    /**
     * Clear cart
     */
    async clearCart(tenantId: string, userId: string | undefined, sessionId: string | undefined): Promise<CartResponseDto> {
        const cart = await this.getCartEntity(tenantId, userId, sessionId);
        if (cart) {
            await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        return this.getCart(tenantId, userId, sessionId);
    }

    // ===========================================
    // HELPERS
    // ===========================================

    private async getCart(tenantId: string, userId?: string, sessionId?: string): Promise<CartResponseDto> {
        const cart = await this.prisma.cart.findFirst({
            where: {
                tenantId,
                ...(userId ? { userId } : { sessionId }),
            },
            include: {
                items: {
                    include: {
                        offering: {
                            select: { id: true, name: true, slug: true, image: true, priceCents: true },
                        },
                    },
                },
            },
        });

        return this.formatCartResponse(cart);
    }

    private async getCartEntity(tenantId: string, userId?: string, sessionId?: string) {
        return this.prisma.cart.findFirst({
            where: {
                tenantId,
                ...(userId ? { userId } : { sessionId }),
            },
        });
    }

    private async getOrCreateCartEntity(tenantId: string, userId?: string, sessionId?: string) {
        let cart = await this.getCartEntity(tenantId, userId, sessionId);

        if (!cart) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            cart = await this.prisma.cart.create({
                data: {
                    tenantId,
                    userId: userId || undefined,
                    sessionId: sessionId || undefined,
                    expiresAt,
                },
            });
        }

        return cart;
    }

    private formatCartResponse(cart: any): CartResponseDto {
        if (!cart) {
            return { id: '', items: [], itemCount: 0, subtotalCents: 0 };
        }

        const items: CartItemResponseDto[] = (cart.items || []).map((item: any) => ({
            id: item.id,
            offeringId: item.offeringId,
            offeringName: item.offering?.name || 'Unknown',
            offeringSlug: item.offering?.slug || '',
            offeringImage: item.offering?.image,
            quantity: item.quantity,
            priceCents: item.priceCents,
            totalCents: item.priceCents * item.quantity,
        }));

        return {
            id: cart.id,
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotalCents: items.reduce((sum, i) => sum + i.totalCents, 0),
        };
    }
}
