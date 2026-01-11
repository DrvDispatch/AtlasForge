import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the full tenant context from the request.
 * Usage: @CurrentTenant() tenant: TenantContext
 */
export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
});

/**
 * Decorator to extract just the tenantId from the request.
 * Usage: @TenantId() tenantId: string
 *
 * This is the primary way to get tenant scoping in controllers.
 * All database queries should use this ID for row-level isolation.
 */
export const TenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
});

/**
 * Type for tenant context attached to requests
 */
export interface TenantContext {
    id: string;
    name: string;
    slug: string;
    status: string;
    config?: TenantConfigContext;
    features?: TenantFeaturesContext;
}

export interface TenantConfigContext {
    businessName: string;
    logoUrl?: string;
    primaryColor: string;
    email?: string;
    phone?: string;
    locale: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
}

export interface TenantFeaturesContext {
    catalogEnabled: boolean;
    pricingEnabled: boolean;
    bookingsEnabled: boolean;
    ecommerceEnabled: boolean;
    supportEnabled: boolean;
    invoicingEnabled: boolean;
    cmsEnabled: boolean;
    marketingEnabled: boolean;
    reviewsEnabled: boolean;
    analyticsEnabled: boolean;
    aiEnabled: boolean;
}
