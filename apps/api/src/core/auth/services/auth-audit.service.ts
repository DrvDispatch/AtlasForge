import { Injectable, Logger } from '@nestjs/common';

/**
 * Auth event types for audit logging
 */
export enum AuthEvent {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    LOGOUT = 'LOGOUT',
    REGISTER = 'REGISTER',
    PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
    PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
    EMAIL_VERIFIED = 'EMAIL_VERIFIED',
    OAUTH_LOGIN = 'OAUTH_LOGIN',
    TOKEN_REFRESH = 'TOKEN_REFRESH',
    TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',
    ALL_TOKENS_REVOKED = 'ALL_TOKENS_REVOKED',
}

interface AuditLogData {
    event: AuthEvent;
    userId?: string;
    email?: string;
    tenantId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Auth Audit Service
 * 
 * Logs all authentication-related events for security monitoring.
 * Currently logs to console/file; can be extended to store in database.
 */
@Injectable()
export class AuthAuditService {
    private readonly logger = new Logger('AuthAudit');

    /**
     * Log an auth event
     */
    async log(data: AuditLogData): Promise<void> {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: data.event,
            userId: data.userId,
            email: data.email,
            tenantId: data.tenantId,
            ip: data.ip,
            userAgent: data.userAgent,
            ...data.metadata,
        };

        // Log as structured JSON for easy parsing
        this.logger.log(JSON.stringify(logEntry));
    }

    /**
     * Log successful login
     */
    async logLogin(userId: string, email: string, tenantId?: string, ip?: string, userAgent?: string): Promise<void> {
        await this.log({
            event: AuthEvent.LOGIN_SUCCESS,
            userId,
            email,
            tenantId,
            ip,
            userAgent,
        });
    }

    /**
     * Log failed login attempt
     */
    async logLoginFailed(email: string, tenantId?: string, ip?: string, reason?: string): Promise<void> {
        await this.log({
            event: AuthEvent.LOGIN_FAILED,
            email,
            tenantId,
            ip,
            metadata: { reason },
        });
    }

    /**
     * Log OAuth login
     */
    async logOAuthLogin(userId: string, email: string, provider: string, tenantId?: string): Promise<void> {
        await this.log({
            event: AuthEvent.OAUTH_LOGIN,
            userId,
            email,
            tenantId,
            metadata: { provider },
        });
    }

    /**
     * Log logout
     */
    async logLogout(userId: string, tenantId?: string): Promise<void> {
        await this.log({
            event: AuthEvent.LOGOUT,
            userId,
            tenantId,
        });
    }

    /**
     * Log registration
     */
    async logRegister(userId: string, email: string, tenantId?: string): Promise<void> {
        await this.log({
            event: AuthEvent.REGISTER,
            userId,
            email,
            tenantId,
        });
    }

    /**
     * Log token reuse detection (potential security breach)
     */
    async logTokenReuseDetected(userId: string, tenantId?: string): Promise<void> {
        await this.log({
            event: AuthEvent.TOKEN_REUSE_DETECTED,
            userId,
            tenantId,
        });
    }
}
