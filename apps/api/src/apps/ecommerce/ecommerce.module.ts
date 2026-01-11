import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { OrdersService } from './orders.service';
import { CartController, CheckoutController, OrdersController } from './ecommerce.controller';
import { OrdersAdminController } from './orders-admin.controller';

@Module({
    controllers: [
        CartController,
        CheckoutController,
        OrdersController,
        OrdersAdminController,
    ],
    providers: [
        CartService,
        OrdersService,
    ],
    exports: [
        CartService,
        OrdersService,
    ],
})
export class EcommerceModule { }
