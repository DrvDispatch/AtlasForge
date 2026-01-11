import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AvailabilityService } from './availability.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { BookingStatus } from '../../generated/prisma/client';

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly availabilityService: AvailabilityService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    // ==========================================
    // PUBLIC
    // ==========================================

    /**
     * Get available slots for a date
     */
    async getAvailableSlots(tenantId: string, dateStr: string) {
        return this.availabilityService.getAvailableSlots(tenantId, dateStr);
    }

    /**
     * Create a booking (public)
     */
    async create(tenantId: string, dto: CreateBookingDto, customerId?: string) {
        const bookingDate = new Date(dto.date);

        // 1. Validate slot availability
        const isAvailable = await this.availabilityService.isSlotAvailable(
            tenantId,
            bookingDate,
            dto.timeSlot,
        );

        if (!isAvailable) {
            throw new ConflictException('This time slot is not available');
        }

        // 2. Verify offering exists and is active
        const offering = await this.prisma.offering.findFirst({
            where: { id: dto.offeringId, tenantId, isActive: true },
        });

        if (!offering) {
            throw new NotFoundException('Offering not found');
        }

        // 3. Create booking
        const booking = await this.prisma.booking.create({
            data: {
                tenantId,
                offeringId: dto.offeringId,
                customerId,
                customerName: dto.customerName,
                customerEmail: dto.customerEmail,
                customerPhone: dto.customerPhone,
                date: bookingDate,
                timeSlot: dto.timeSlot,
                notes: dto.notes,
                status: 'CONFIRMED',
            },
            include: {
                offering: { select: { id: true, name: true, priceCents: true, durationMinutes: true } },
            },
        });

        // 4. Emit event for notifications (async, non-blocking)
        this.eventEmitter.emit('booking.created', { booking, offering });

        this.logger.log(`Booking created: ${booking.id} for ${dto.customerEmail}`);

        return booking;
    }

    // ==========================================
    // ADMIN
    // ==========================================

    /**
     * List all bookings (admin)
     */
    async findAllAdmin(tenantId: string, filters?: { date?: string; status?: BookingStatus }) {
        const where: Record<string, unknown> = { tenantId };

        if (filters?.date) {
            where.date = new Date(filters.date);
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        return this.prisma.booking.findMany({
            where,
            include: {
                offering: { select: { id: true, name: true, priceCents: true } },
                customer: { select: { id: true, name: true, email: true } },
            },
            orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
        });
    }

    /**
     * Get a single booking (admin)
     */
    async findOne(tenantId: string, id: string) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, tenantId },
            include: {
                offering: { select: { id: true, name: true, priceCents: true, durationMinutes: true } },
                customer: { select: { id: true, name: true, email: true, phone: true } },
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    /**
     * Update booking status (admin)
     */
    async update(tenantId: string, id: string, dto: UpdateBookingDto) {
        const booking = await this.findOne(tenantId, id);
        const previousStatus = booking.status;

        const updated = await this.prisma.booking.update({
            where: { id },
            data: {
                status: dto.status as BookingStatus,
                adminNotes: dto.adminNotes,
            },
        });

        // Emit status change event
        if (dto.status && dto.status !== previousStatus) {
            this.eventEmitter.emit('booking.status_changed', {
                booking: updated,
                previousStatus,
                newStatus: dto.status,
            });
        }

        return updated;
    }
}
