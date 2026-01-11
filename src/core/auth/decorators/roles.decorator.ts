import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to require specific roles for a route.
 * Usage: @Roles('ADMIN', 'OWNER')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
