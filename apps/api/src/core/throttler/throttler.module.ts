import { Module, Global } from '@nestjs/common';
import { ThrottlerModule as NestThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * Rate Limiting Configuration
 * 
 * Named throttlers for different endpoint types:
 * - 'auth': Aggressive limits for auth endpoints (5 requests / 60 seconds)
 * - 'public': Standard limits for public APIs (30 requests / 60 seconds)
 * - 'admin': Lighter limits for authenticated admin routes (100 requests / 60 seconds)
 */
@Global()
@Module({
    imports: [
        NestThrottlerModule.forRoot([
            {
                name: 'auth',
                ttl: 60000,      // 60 seconds
                limit: 20,       // 20 requests per minute for auth (was 5)
            },
            {
                name: 'public',
                ttl: 60000,      // 60 seconds  
                limit: 100,      // 100 requests per minute (was 30)
            },
            {
                name: 'admin',
                ttl: 60000,      // 60 seconds
                limit: 200,      // 200 requests per minute (was 100)
            },
        ]),
    ],
    providers: [
        // Global guard (can be overridden per-route with @SkipThrottle or @Throttle)
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [NestThrottlerModule],
})
export class ThrottlerModule { }
