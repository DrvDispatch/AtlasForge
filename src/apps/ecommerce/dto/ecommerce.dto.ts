import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEmail, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ===========================================
// CART DTOs
// ===========================================

export class AddToCartDto {
    @ApiProperty({ description: 'Offering ID to add' })
    @IsString()
    offeringId: string;

    @ApiPropertyOptional({ description: 'Quantity (default 1)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number = 1;
}

export class UpdateCartItemDto {
    @ApiProperty({ description: 'New quantity' })
    @IsInt()
    @Min(0)
    quantity: number;
}

export class CartItemResponseDto {
    id: string;
    offeringId: string;
    offeringName: string;
    offeringSlug: string;
    offeringImage?: string;
    quantity: number;
    priceCents: number;
    totalCents: number;
}

export class CartResponseDto {
    id: string;
    items: CartItemResponseDto[];
    itemCount: number;
    subtotalCents: number;
}

// ===========================================
// CHECKOUT / ORDER DTOs
// ===========================================

export class AddressDto {
    @ApiProperty()
    @IsString()
    street: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    street2?: string;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsString()
    postalCode: string;

    @ApiProperty()
    @IsString()
    country: string;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Customer email' })
    @IsEmail()
    customerEmail: string;

    @ApiProperty({ description: 'Customer name' })
    @IsString()
    customerName: string;

    @ApiPropertyOptional({ description: 'Customer phone' })
    @IsOptional()
    @IsString()
    customerPhone?: string;

    @ApiPropertyOptional({ description: 'Shipping address' })
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    shippingAddress?: AddressDto;

    @ApiPropertyOptional({ description: 'Billing address (defaults to shipping)' })
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    billingAddress?: AddressDto;

    @ApiPropertyOptional({ description: 'Customer notes' })
    @IsOptional()
    @IsString()
    customerNotes?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ description: 'New status' })
    @IsString()
    status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

    @ApiPropertyOptional({ description: 'Admin notes' })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}

export class OrderItemResponseDto {
    id: string;
    offeringId?: string;
    offeringName: string;
    offeringSlug?: string;
    offeringImage?: string;
    quantity: number;
    priceCents: number;
    totalCents: number;
}

export class OrderResponseDto {
    id: string;
    orderNumber: string;
    status: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    items: OrderItemResponseDto[];
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    taxCents: number;
    totalCents: number;
    currency: string;
    shippingAddress?: any;
    billingAddress?: any;
    createdAt: Date;
    paidAt?: Date;
    completedAt?: Date;
}
