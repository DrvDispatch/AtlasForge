import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';

export interface EmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    tags?: Array<{ name: string; value: string }>;
}

/**
 * Email Service
 * 
 * Sends transactional emails via Resend API.
 * Uses tenant branding for personalized emails.
 */
@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private client: Resend | null = null;
    private defaultFrom: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.defaultFrom = this.configService.get('EMAIL_FROM', 'AtlasForge <noreply@atlasforge.dev>');
    }

    onModuleInit() {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');

        if (apiKey) {
            this.client = new Resend(apiKey);
            this.logger.log('Resend client initialized');
        } else {
            this.logger.warn('RESEND_API_KEY not set - emails will be logged only');
        }
    }

    /**
     * Send email via Resend
     */
    async send(payload: EmailPayload & { from?: string }): Promise<{ id: string } | null> {
        const { to, subject, html, text, replyTo, from, tags } = payload;

        if (!this.client) {
            // Log the email in development
            this.logger.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
            return { id: 'dev-' + Date.now() };
        }

        try {
            const { data, error } = await this.client.emails.send({
                from: from || this.defaultFrom,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text,
                replyTo: replyTo ? [replyTo] : undefined,
                tags,
            });

            if (error) {
                this.logger.error(`Email send failed: ${error.message}`);
                return null;
            }

            this.logger.log(`Email sent: ${data?.id} to ${to}`);
            return { id: data?.id || '' };
        } catch (err) {
            this.logger.error(`Email send exception: ${err}`);
            return null;
        }
    }

    /**
     * Get tenant branding for email templates
     */
    async getTenantBranding(tenantId: string) {
        const config = await this.prisma.tenantConfig.findUnique({
            where: { tenantId },
            select: {
                businessName: true,
                primaryColor: true,
                email: true,
            },
        });

        return {
            businessName: config?.businessName || 'AtlasForge',
            primaryColor: config?.primaryColor || '#2563eb',
            logo: null as string | null, // Logo can be added to TenantConfig later
            supportEmail: config?.email || 'support@atlasforge.dev',
        };
    }
}
