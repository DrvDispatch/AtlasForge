import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';

/**
 * In-memory store for OAuth state tokens
 * In production, use Redis for multi-instance environments
 */
const oauthStateStore = new Map<string, {
    tenantId: string;
    returnUrl: string;
    expiresAt: Date;
}>();

export interface GoogleUserProfile {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}

/**
 * Google OAuth Service
 * 
 * Handles Google OAuth flow using google-auth-library.
 * - Generates auth URLs with state tokens
 * - Exchanges authorization codes for tokens
 * - Verifies ID tokens and extracts user profile
 */
@Injectable()
export class GoogleOAuthService {
    private readonly logger = new Logger(GoogleOAuthService.name);
    private oauth2Client: OAuth2Client | null = null;
    private clientId: string | undefined;
    private callbackUrl: string | undefined;
    private enabled = false;

    constructor(private readonly configService: ConfigService) {
        this.clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        this.callbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL');

        if (this.clientId && clientSecret && this.callbackUrl) {
            this.oauth2Client = new OAuth2Client(
                this.clientId,
                clientSecret,
                this.callbackUrl,
            );
            this.enabled = true;
            this.logger.log('Google OAuth initialized');
        } else {
            this.logger.warn('Google OAuth not configured - missing credentials');
        }

        // Clean up expired states every minute
        setInterval(() => this.cleanupExpiredStates(), 60000);
    }

    /**
     * Check if Google OAuth is configured
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Create a state token for CSRF protection
     * Stores tenant info server-side (one-time use, expires in 10 min)
     */
    createOAuthState(tenantId: string, returnUrl: string = '/'): string {
        const state = randomBytes(16).toString('hex');

        oauthStateStore.set(state, {
            tenantId,
            returnUrl,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        this.logger.debug(`Created OAuth state for tenant: ${tenantId}`);
        return state;
    }

    /**
     * Retrieve and consume state token data
     */
    getStateData(state: string): { tenantId: string; returnUrl: string } | null {
        const data = oauthStateStore.get(state);

        if (!data) {
            this.logger.warn(`OAuth state not found: ${state}`);
            return null;
        }

        if (data.expiresAt < new Date()) {
            this.logger.warn(`OAuth state expired: ${state}`);
            oauthStateStore.delete(state);
            return null;
        }

        // One-time use: delete after retrieval
        oauthStateStore.delete(state);
        return { tenantId: data.tenantId, returnUrl: data.returnUrl };
    }

    /**
     * Generate Google OAuth authorization URL
     */
    generateAuthUrl(state: string): string {
        if (!this.clientId || !this.callbackUrl) {
            throw new Error('Google OAuth not configured');
        }

        // Build URL manually to avoid encoding issues
        const params = [
            `client_id=${this.clientId}`,
            `redirect_uri=${this.callbackUrl}`,
            `response_type=code`,
            `scope=${encodeURIComponent('email profile')}`,
            `state=${state}`,
            `access_type=offline`,
            `prompt=consent`,
        ].join('&');

        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    /**
     * Exchange authorization code for tokens and get user profile
     */
    async handleCallback(code: string): Promise<GoogleUserProfile> {
        if (!this.oauth2Client || !this.clientId) {
            throw new Error('Google OAuth not configured');
        }

        // Exchange code for tokens
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        // Verify ID token and extract user info
        const ticket = await this.oauth2Client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: this.clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('Failed to get user profile from Google');
        }

        this.logger.log(`Google user verified: ${payload.email}`);

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || payload.email,
            avatar: payload.picture,
        };
    }

    /**
     * Clean up expired state tokens
     */
    private cleanupExpiredStates(): void {
        const now = new Date();
        let cleaned = 0;
        for (const [state, data] of oauthStateStore.entries()) {
            if (data.expiresAt < now) {
                oauthStateStore.delete(state);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.logger.debug(`Cleaned up ${cleaned} expired OAuth states`);
        }
    }
}
