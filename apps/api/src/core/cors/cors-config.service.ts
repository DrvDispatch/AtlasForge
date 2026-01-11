import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CORS Configuration Service
 * 
 * Manages allowed origins for proper multi-tenant CORS.
 * Reads tenant origins from TenantConfig (frontendUrl + allowedOrigins).
 */
@Injectable()
export class CorsConfigService {
    private readonly logger = new Logger(CorsConfigService.name);

    // Owner panel origins from env
    private readonly ownerOrigins: string[];

    // Static tenant origins from env (fallback)
    private readonly staticTenantOrigins: string[];

    // Cache of tenant origins from DB (TTL: 5 minutes)
    private tenantOriginsCache = new Map<string, { origins: string[]; expiresAt: number }>();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000;

    constructor(private readonly prisma: PrismaService) {
        // Owner panel gets special treatment
        this.ownerOrigins = (process.env.OWNER_CORS_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());

        // Static tenant origins (fallback for dev)
        this.staticTenantOrigins = (process.env.TENANT_CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost:3000').split(',').map(s => s.trim());
    }

    /**
     * Check if origin is allowed (sync version for CORS middleware)
     */
    isOriginAllowed(origin: string): boolean {
        // Always allow in development
        if (process.env.NODE_ENV === 'development') {
            return true;
        }

        // Owner panel always allowed
        if (this.ownerOrigins.includes(origin)) {
            return true;
        }

        // Static tenant origins (fallback)
        if (this.staticTenantOrigins.includes(origin)) {
            return true;
        }

        // Check cached tenant origins
        for (const [, entry] of this.tenantOriginsCache) {
            if (entry.expiresAt > Date.now() && entry.origins.includes(origin)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Load and cache tenant origins from database
     */
    async loadTenantOrigins(): Promise<void> {
        try {
            const configs = await this.prisma.tenantConfig.findMany({
                select: {
                    tenantId: true,
                    frontendUrl: true,
                    allowedOrigins: true,
                },
            });

            for (const config of configs) {
                const origins: string[] = [];

                if (config.frontendUrl) {
                    origins.push(config.frontendUrl);
                }

                if (config.allowedOrigins && config.allowedOrigins.length > 0) {
                    origins.push(...config.allowedOrigins);
                }

                if (origins.length > 0) {
                    this.tenantOriginsCache.set(config.tenantId, {
                        origins,
                        expiresAt: Date.now() + this.CACHE_TTL_MS,
                    });
                }
            }

            this.logger.log(`Loaded CORS origins for ${configs.length} tenants`);
        } catch (error) {
            this.logger.error('Failed to load tenant origins:', error);
        }
    }

    /**
     * Get dynamic CORS configuration for NestJS
     */
    getCorsConfiguration() {
        // Load tenant origins on startup
        this.loadTenantOrigins();

        return {
            origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
                // No origin = same-origin request (allow)
                if (!origin) {
                    callback(null, true);
                    return;
                }

                // In development, allow all
                if (process.env.NODE_ENV === 'development') {
                    callback(null, true);
                    return;
                }

                // Check if origin is allowed
                if (this.isOriginAllowed(origin)) {
                    callback(null, true);
                    return;
                }

                this.logger.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Request-Id'],
            exposedHeaders: ['X-Request-Id'],
        };
    }

    /**
     * Invalidate cache for a tenant (call after config changes)
     */
    invalidateCache(tenantId?: string) {
        if (tenantId) {
            this.tenantOriginsCache.delete(tenantId);
        } else {
            this.tenantOriginsCache.clear();
        }
        // Reload origins
        this.loadTenantOrigins();
    }
}
