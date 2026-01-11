import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../notifications/email.service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Auth Email Service
 * 
 * Handles sending authentication-related emails:
 * - Email verification
 * - Password reset
 */
@Injectable()
export class AuthEmailService {
    private readonly logger = new Logger(AuthEmailService.name);
    private readonly frontendUrl: string;

    constructor(
        private readonly emailService: EmailService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    }

    /**
     * Send email verification link
     */
    async sendVerificationEmail(
        user: { email: string; name: string },
        token: string,
        tenantId?: string,
    ): Promise<void> {
        const verifyUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
        const branding = tenantId
            ? await this.emailService.getTenantBranding(tenantId)
            : { businessName: 'AtlasForge', primaryColor: '#111', supportEmail: 'support@atlasforge.dev' };

        await this.emailService.send({
            to: user.email,
            subject: `Verify your email - ${branding.businessName}`,
            html: this.verificationEmailTemplate({
                name: user.name,
                verifyUrl,
                businessName: branding.businessName,
                primaryColor: branding.primaryColor,
            }),
        });

        this.logger.log(`Verification email sent to: ${user.email}`);
    }

    /**
     * Send password reset link
     */
    async sendPasswordResetEmail(
        user: { email: string; name: string },
        token: string,
        tenantId?: string,
    ): Promise<void> {
        const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
        const branding = tenantId
            ? await this.emailService.getTenantBranding(tenantId)
            : { businessName: 'AtlasForge', primaryColor: '#111', supportEmail: 'support@atlasforge.dev' };

        await this.emailService.send({
            to: user.email,
            subject: `Reset your password - ${branding.businessName}`,
            html: this.passwordResetEmailTemplate({
                name: user.name,
                resetUrl,
                businessName: branding.businessName,
                primaryColor: branding.primaryColor,
            }),
        });

        this.logger.log(`Password reset email sent to: ${user.email}`);
    }

    // ============================================
    // Email Templates
    // ============================================

    private verificationEmailTemplate(data: {
        name: string;
        verifyUrl: string;
        businessName: string;
        primaryColor: string;
    }): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; border: 1px solid #eee;">
        <h1 style="font-size: 20px; font-weight: 600; color: #111; margin: 0 0 16px;">Verify your email</h1>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 24px;">
            Hi ${data.name},<br><br>
            Thanks for signing up! Please verify your email address by clicking the button below.
        </p>
        <a href="${data.verifyUrl}" style="display: inline-block; padding: 14px 28px; background: ${data.primaryColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">
            Verify Email
        </a>
        <p style="font-size: 13px; color: #888; margin: 32px 0 0; line-height: 1.5;">
            If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
        <p style="font-size: 13px; color: #888; margin: 0;">${data.businessName}</p>
    </div>
</body>
</html>`;
    }

    private passwordResetEmailTemplate(data: {
        name: string;
        resetUrl: string;
        businessName: string;
        primaryColor: string;
    }): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; border: 1px solid #eee;">
        <h1 style="font-size: 20px; font-weight: 600; color: #111; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 24px;">
            Hi ${data.name},<br><br>
            We received a request to reset your password. Click the button below to set a new password.
        </p>
        <a href="${data.resetUrl}" style="display: inline-block; padding: 14px 28px; background: ${data.primaryColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">
            Reset Password
        </a>
        <p style="font-size: 13px; color: #888; margin: 32px 0 0; line-height: 1.5;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
        <p style="font-size: 13px; color: #888; margin: 0;">${data.businessName}</p>
    </div>
</body>
</html>`;
    }
}
