import { Module } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { OfferingsController } from './offerings.controller';
import { OfferingsAdminController } from './offerings-admin.controller';

@Module({
    controllers: [OfferingsController, OfferingsAdminController],
    providers: [OfferingsService],
    exports: [OfferingsService],
})
export class OfferingsModule { }
