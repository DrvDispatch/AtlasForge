import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * AvailabilityService
 * Calculates available booking slots based on TenantConfig and existing bookings.
 * Pattern adapted from mobile-shop appointments.service.ts
 */
@Injectable()
export class AvailabilityService {
    private readonly logger = new Logger(AvailabilityService.name);

    // Default fallbacks if not configured in TenantConfig
    private readonly DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    private readonly DEFAULT_CLOSED_DAYS = [0]; // Sunday

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Fetch business hours config from TenantConfig
     */
    async getBusinessConfig(tenantId: string): Promise<{ timeSlots: string[]; closedDays: number[] }> {
        const config = await this.prisma.tenantConfig.findUnique({
            where: { tenantId },
            select: { timeSlots: true, closedDays: true },
        });

        return {
            timeSlots: (config?.timeSlots as string[]) || this.DEFAULT_TIME_SLOTS,
            closedDays: config?.closedDays || this.DEFAULT_CLOSED_DAYS,
        };
    }

    /**
     * Get available slots for a specific date
     */
    async getAvailableSlots(tenantId: string, dateStr: string): Promise<{
        date: string;
        slots: string[];
        closed: boolean;
    }> {
        const { timeSlots, closedDays } = await this.getBusinessConfig(tenantId);
        const date = new Date(dateStr);

        // Check if closed day
        if (closedDays.includes(date.getDay())) {
            return { date: dateStr, slots: [], closed: true };
        }

        // Get booked slots for this date (tenant-scoped)
        const bookedAppointments = await this.prisma.booking.findMany({
            where: {
                tenantId,
                date,
                status: { not: 'CANCELLED' },
            },
            select: { timeSlot: true },
        });

        const bookedSlots = bookedAppointments.map(b => b.timeSlot);
        const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));

        return {
            date: dateStr,
            slots: availableSlots,
            closed: false,
        };
    }

    /**
     * Check if a specific slot is available
     */
    async isSlotAvailable(tenantId: string, date: Date, timeSlot: string): Promise<boolean> {
        const { timeSlots, closedDays } = await this.getBusinessConfig(tenantId);

        // Check if closed day
        if (closedDays.includes(date.getDay())) {
            return false;
        }

        // Check if valid slot
        if (!timeSlots.includes(timeSlot)) {
            return false;
        }

        // Check if already booked
        const existing = await this.prisma.booking.findFirst({
            where: {
                tenantId,
                date,
                timeSlot,
                status: { not: 'CANCELLED' },
            },
        });

        return !existing;
    }
}
