import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { TenantId } from '../../core/tenancy';
import { CreateBookingDto } from './dto';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    /**
     * GET /bookings/slots?date=YYYY-MM-DD - Get available slots for a date
     */
    @Get('slots')
    getAvailableSlots(@TenantId() tenantId: string, @Query('date') date: string) {
        return this.bookingsService.getAvailableSlots(tenantId, date);
    }

    /**
     * POST /bookings - Create a booking (public)
     */
    @Post()
    create(@TenantId() tenantId: string, @Body() dto: CreateBookingDto) {
        return this.bookingsService.create(tenantId, dto);
    }
}
