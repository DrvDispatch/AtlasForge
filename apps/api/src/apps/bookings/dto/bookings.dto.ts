import { IsString, IsOptional, IsDateString, Matches, MaxLength } from 'class-validator';

export class CreateBookingDto {
    @IsString()
    offeringId: string;

    @IsString()
    @MaxLength(200)
    customerName: string;

    @IsString()
    customerEmail: string;

    @IsString()
    customerPhone: string;

    @IsDateString()
    date: string; // "2026-01-15"

    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Time slot must be in HH:MM format' })
    timeSlot: string; // "09:00"

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
}

export class UpdateBookingDto {
    @IsOptional()
    @IsString()
    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}
