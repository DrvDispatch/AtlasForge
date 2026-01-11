import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core modules (always loaded)
import { PrismaModule } from './prisma/prisma.module';
import { TenancyModule } from './core/tenancy/tenancy.module';
import { ThrottlerModule } from './core/throttler';
import { CorsModule } from './core/cors';
import { NotificationsModule } from './core/notifications';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { SettingsModule } from './core/settings/settings.module';
import { AuditModule } from './core/audit/audit.module';
import { OwnerModule } from './core/owner/owner.module';

// Apps
import { OfferingsModule } from './apps/offerings';
import { BookingsModule } from './apps/bookings';
import { EcommerceModule } from './apps/ecommerce';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['../../.env', '.env', '.env.local'],
        }),

        // Event system for cross-module communication
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            maxListeners: 20,
            verboseMemoryLeak: true,
        }),

        // Database
        PrismaModule,

        // Core modules (always loaded)
        TenancyModule,
        ThrottlerModule,      // Rate limiting
        CorsModule,           // Tenant-aware CORS
        NotificationsModule,  // Email notifications (Resend)
        AuthModule,
        UsersModule,
        SettingsModule,
        AuditModule,
        OwnerModule,

        // Apps
        OfferingsModule,
        BookingsModule,
        EcommerceModule,
    ],
})
export class AppModule { }

