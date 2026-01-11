import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenancyController } from './tenancy.controller';
import { TenantMiddleware } from './tenant.middleware';

@Module({
    controllers: [TenancyController],
    providers: [TenancyService, TenantMiddleware],
    exports: [TenancyService],
})
export class TenancyModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply tenant resolution middleware to all routes
        consumer.apply(TenantMiddleware).forRoutes('*');
    }
}
