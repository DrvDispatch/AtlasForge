import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// Registration & Login
// ============================================

export class RegisterDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: 'securePassword123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'securePassword123' })
    @IsString()
    password: string;
}

export class AdminLoginDto {
    @ApiProperty({ example: 'admin@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'adminPassword123' })
    @IsString()
    password: string;
}

export class OwnerLoginDto {
    @ApiProperty({ example: 'owner@atlasforge.dev' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'ownerPassword123' })
    @IsString()
    password: string;
}

// ============================================
// Password Reset
// ============================================

export class ForgotPasswordDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Reset token from email' })
    @IsString()
    token: string;

    @ApiProperty({ example: 'newSecurePassword123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;
}

// ============================================
// Email Verification
// ============================================

export class VerifyEmailDto {
    @ApiProperty({ description: 'Verification token from email' })
    @IsString()
    token: string;
}

export class ResendVerificationDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;
}

// ============================================
// Responses
// ============================================

export class AuthUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    emailVerified: boolean;

    @ApiPropertyOptional()
    avatar?: string;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken?: string;

    @ApiProperty({ type: AuthUserDto })
    user: AuthUserDto;
}

export class MessageResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty()
    success: boolean;
}
