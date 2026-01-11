import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AvailabilityService } from './availability.service';
import { BookingsController } from './bookings.controller';
import { BookingsAdminController } from './bookings-admin.controller';

@Module({
    controllers: [BookingsController, BookingsAdminController],
    providers: [BookingsService, AvailabilityService],
    exports: [BookingsService, AvailabilityService],
})
export class BookingsModule { }
