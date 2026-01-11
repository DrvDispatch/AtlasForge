import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { CartService } from './cart.service';
import { OrdersService } from './orders.service';
import { TenantId } from '../../core/tenancy/tenant.decorator';
import { AddToCartDto, UpdateCartItemDto, CreateOrderDto } from './dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';

// Custom interface for request with user
interface RequestWithUser extends Request {
    user?: { id: string; email: string; role: string; tenantId: string };
    cookies?: Record<string, string>;
}

/**
 * Helper to get or create cart session ID for anonymous users
 * Sets a cookie if a new session is generated
 */
function getOrCreateSessionId(
    req: RequestWithUser,
    res: Response,
): string | undefined {
    // If user is logged in, don't need session
    if (req.user?.id) {
        return undefined;
    }

    // Check existing cookie (cookie-parser populates req.cookies)
    const existingSession = req.cookies?.['cart_session'];
    if (existingSession) {
        return existingSession;
    }

    // Generate new session and set cookie
    const newSessionId = randomUUID();
    res.cookie('cart_session', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
    });

    return newSessionId;
}

@ApiTags('Cart')
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiOperation({ summary: 'Get current cart' })
    async getCart(
        @TenantId() tenantId: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = req.user?.id;
        const sessionId = getOrCreateSessionId(req, res);
        return this.cartService.getOrCreateCart(tenantId, userId, sessionId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add item to cart' })
    async addItem(
        @TenantId() tenantId: string,
        @Body() dto: AddToCartDto,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = req.user?.id;
        const sessionId = getOrCreateSessionId(req, res);
        return this.cartService.addItem(tenantId, userId, sessionId, dto);
    }

    @Patch('items/:itemId')
    @ApiOperation({ summary: 'Update cart item quantity' })
    async updateItem(
        @TenantId() tenantId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = req.user?.id;
        const sessionId = getOrCreateSessionId(req, res);
        return this.cartService.updateItem(tenantId, userId, sessionId, itemId, dto);
    }

    @Delete('items/:itemId')
    @ApiOperation({ summary: 'Remove item from cart' })
    async removeItem(
        @TenantId() tenantId: string,
        @Param('itemId') itemId: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = req.user?.id;
        const sessionId = getOrCreateSessionId(req, res);
        return this.cartService.removeItem(tenantId, userId, sessionId, itemId);
    }

    @Delete()
    @ApiOperation({ summary: 'Clear cart' })
    async clearCart(
        @TenantId() tenantId: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = req.user?.id;
        const sessionId = getOrCreateSessionId(req, res);
        return this.cartService.clearCart(tenantId, userId, sessionId);
    }
}

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create order from cart' })
    async checkout(
        @TenantId() tenantId: string,
        @Body() dto: CreateOrderDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = req.user?.id;
        const sessionId = req.cookies?.['cart_session'] || undefined;
        return this.ordersService.createFromCart(tenantId, userId, sessionId, dto);
    }
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('track/:orderNumber')
    @ApiOperation({ summary: 'Track order by order number and email' })
    async trackOrder(
        @TenantId() tenantId: string,
        @Param('orderNumber') orderNumber: string,
        @Query('email') email: string,
    ) {
        return this.ordersService.getByOrderNumber(tenantId, orderNumber, email);
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my orders' })
    async getMyOrders(
        @TenantId() tenantId: string,
        @Req() req: RequestWithUser,
    ) {
        return this.ordersService.getMyOrders(tenantId, req.user!.id);
    }
}
