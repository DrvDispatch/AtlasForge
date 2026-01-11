import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { TenantId } from '../../core/tenancy';
import { JwtAuthGuard, RolesGuard, Roles } from '../../core/auth';
import { UpdateBookingDto } from './dto';
import { BookingStatus } from '../../generated/prisma/client';

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class BookingsAdminController {
    constructor(private readonly bookingsService: BookingsService) { }

    /**
     * GET /admin/bookings - List all bookings
     */
    @Get()
    findAll(
        @TenantId() tenantId: string,
        @Query('date') date?: string,
        @Query('status') status?: BookingStatus,
    ) {
        return this.bookingsService.findAllAdmin(tenantId, { date, status });
    }

    /**
     * GET /admin/bookings/:id - Get a single booking
     */
    @Get(':id')
    findOne(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.bookingsService.findOne(tenantId, id);
    }

    /**
     * PATCH /admin/bookings/:id - Update booking status
     */
    @Patch(':id')
    update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateBookingDto,
    ) {
        return this.bookingsService.update(tenantId, id, dto);
    }
}
