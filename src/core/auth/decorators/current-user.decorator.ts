import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the current authenticated user from the request.
 * Usage: @CurrentUser() user: AuthenticatedUser
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});

/**
 * Type for authenticated user attached to requests
 */
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
    isActive: boolean;
    emailVerified: boolean;
    avatar?: string;
    isImpersonating?: boolean;
    impersonatedBy?: string;
}
