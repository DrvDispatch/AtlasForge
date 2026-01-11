import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext, TenantConfigContext, TenantFeaturesContext } from './tenant.decorator';

// Custom types to avoid direct dependency on @types/express
type RequestLike = {
    originalUrl?: string;
    path?: string;
    url: string;
    get: (header: string) => string | undefined;
    tenant?: TenantContext;
    tenantId?: string;
    features?: TenantFeaturesContext;
    [key: string]: any;
};

type ResponseLike = {
    status: (code: number) => ResponseLike;
    json: (body: Record<string, unknown>) => void;
    [key: string]: any;
};

type NextFunctionLike = () => void;

// Default features when no TenantFeature record exists
const DEFAULT_FEATURES: TenantFeaturesContext = {
    catalogEnabled: true,
    pricingEnabled: true,
    bookingsEnabled: false,
    ecommerceEnabled: false,
    supportEnabled: false,
    invoicingEnabled: false,
    cmsEnabled: true,
    marketingEnabled: false,
    reviewsEnabled: false,
    analyticsEnabled: true,
    aiEnabled: false,
};

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);

    // Cache tenant lookups (TTL: 5 minutes)
    private static tenantCache = new Map<
        string,
        { tenant: TenantContext; features: TenantFeaturesContext; expiresAt: number }
    >();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000;

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Invalidate cache for a specific domain or tenant
     */
    static invalidateCache(domainOrTenantId?: string): void {
        if (!domainOrTenantId) {
            TenantMiddleware.tenantCache.clear();
            return;
        }

        for (const [domain, entry] of TenantMiddleware.tenantCache.entries()) {
            if (domain === domainOrTenantId || entry.tenant?.id === domainOrTenantId) {
                TenantMiddleware.tenantCache.delete(domain);
            }
        }
    }

    async use(req: RequestLike, res: ResponseLike, next: NextFunctionLike) {
        const path = req.originalUrl?.split('?')[0] || req.path || req.url.split('?')[0];

        // Skip tenant resolution for platform-level routes
        const skipPaths = [
            '/api/owner',
            '/owner',
            '/api/auth/owner-login',
            '/auth/owner-login',
            '/api/auth/google',
            '/auth/google',
            '/api/webhooks',
            '/webhooks',
            '/health',
        ];

        if (skipPaths.some((p) => path.startsWith(p) || path === p)) {
            return next();
        }

        // Check for X-Tenant-Id header first (used by frontend apps)
        const tenantIdHeader = req.get('x-tenant-id');
        if (tenantIdHeader) {
            const result = await this.resolveTenantById(tenantIdHeader);
            if (result) {
                req.tenant = result.tenant;
                req.tenantId = result.tenant.id;
                req.features = result.features;
                return next();
            }
            // If tenant ID not found, continue to domain-based lookup
            this.logger.warn(`Tenant ID not found: ${tenantIdHeader}, falling back to domain lookup`);
        }

        // Extract and normalize domain from Host header
        const host = req.get('x-forwarded-host') || req.get('host');

        if (!host) {
            this.logger.warn('No host header found in request');
            return res.status(400).json({
                statusCode: 400,
                message: 'Missing Host header',
                error: 'Bad Request',
            });
        }

        const normalizedDomain = this.normalizeDomain(host);

        if (!normalizedDomain) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Invalid Host header',
                error: 'Bad Request',
            });
        }

        // Check cache first
        const cached = TenantMiddleware.tenantCache.get(normalizedDomain);
        if (cached && cached.expiresAt > Date.now()) {
            if (cached.tenant.status !== 'ACTIVE') {
                TenantMiddleware.tenantCache.delete(normalizedDomain);
                return this.handleInactiveTenant(res, cached.tenant.status);
            }

            req.tenant = cached.tenant;
            req.tenantId = cached.tenant.id;
            req.features = cached.features;
            return next();
        }

        try {
            // Look up tenant by domain
            const tenantDomain = await this.prisma.tenantDomain.findUnique({
                where: { domain: normalizedDomain },
                include: {
                    tenant: {
                        include: {
                            config: true,
                            features: true,
                        },
                    },
                },
            });

            if (!tenantDomain) {
                this.logger.warn(`No tenant found for domain: ${normalizedDomain}`);
                return res.status(404).json({
                    statusCode: 404,
                    message: `Tenant not configured for domain: ${normalizedDomain}`,
                    error: 'Not Found',
                });
            }

            if (tenantDomain.tenant.status !== 'ACTIVE') {
                return this.handleInactiveTenant(res, tenantDomain.tenant.status);
            }

            // Build tenant context
            const tenantContext: TenantContext = {
                id: tenantDomain.tenant.id,
                name: tenantDomain.tenant.name,
                slug: tenantDomain.tenant.slug,
                status: tenantDomain.tenant.status,
                config: tenantDomain.tenant.config
                    ? {
                        businessName: tenantDomain.tenant.config.businessName,
                        logoUrl: tenantDomain.tenant.config.logoUrl || undefined,
                        primaryColor: tenantDomain.tenant.config.primaryColor,
                        email: tenantDomain.tenant.config.email || undefined,
                        phone: tenantDomain.tenant.config.phone || undefined,
                        locale: tenantDomain.tenant.config.locale,
                        currency: tenantDomain.tenant.config.currency,
                        currencySymbol: tenantDomain.tenant.config.currencySymbol,
                        timezone: tenantDomain.tenant.config.timezone,
                    }
                    : undefined,
            };

            // Build features context
            const features: TenantFeaturesContext = tenantDomain.tenant.features
                ? {
                    catalogEnabled: tenantDomain.tenant.features.catalogEnabled,
                    pricingEnabled: tenantDomain.tenant.features.pricingEnabled,
                    bookingsEnabled: tenantDomain.tenant.features.bookingsEnabled,
                    ecommerceEnabled: tenantDomain.tenant.features.ecommerceEnabled,
                    supportEnabled: tenantDomain.tenant.features.supportEnabled,
                    invoicingEnabled: tenantDomain.tenant.features.invoicingEnabled,
                    cmsEnabled: tenantDomain.tenant.features.cmsEnabled,
                    marketingEnabled: tenantDomain.tenant.features.marketingEnabled,
                    reviewsEnabled: tenantDomain.tenant.features.reviewsEnabled,
                    analyticsEnabled: tenantDomain.tenant.features.analyticsEnabled,
                    aiEnabled: tenantDomain.tenant.features.aiEnabled,
                }
                : DEFAULT_FEATURES;

            // Cache the result
            TenantMiddleware.tenantCache.set(normalizedDomain, {
                tenant: tenantContext,
                features,
                expiresAt: Date.now() + this.CACHE_TTL_MS,
            });

            // Attach to request
            req.tenant = tenantContext;
            req.tenantId = tenantContext.id;
            req.features = features;

            next();
        } catch (error) {
            this.logger.error(`Error resolving tenant for domain ${normalizedDomain}:`, error);
            return res.status(500).json({
                statusCode: 500,
                message: 'Unable to resolve tenant',
                error: 'Internal Server Error',
            });
        }
    }

    private handleInactiveTenant(res: ResponseLike, status: string) {
        if (status === 'SUSPENDED') {
            return res.status(403).json({
                statusCode: 403,
                message: 'This account has been suspended',
                error: 'Tenant Suspended',
                code: 'TENANT_SUSPENDED',
            });
        }

        return res.status(503).json({
            statusCode: 503,
            message: 'This site is temporarily unavailable',
            error: 'Service Unavailable',
        });
    }

    private normalizeDomain(host: string): string | null {
        try {
            let domain = host.toLowerCase().trim();
            domain = domain.split(':')[0]; // Remove port
            if (domain.startsWith('www.')) {
                domain = domain.substring(4);
            }
            if (domain.endsWith('.')) {
                domain = domain.slice(0, -1);
            }
            return domain || null;
        } catch {
            return null;
        }
    }

    /**
     * Resolve tenant by ID (from X-Tenant-Id header)
     */
    private async resolveTenantById(
        tenantId: string,
    ): Promise<{ tenant: TenantContext; features: TenantFeaturesContext } | null> {
        // Check cache first
        for (const [, entry] of TenantMiddleware.tenantCache.entries()) {
            if (entry.tenant.id === tenantId && entry.expiresAt > Date.now()) {
                if (entry.tenant.status === 'ACTIVE') {
                    return { tenant: entry.tenant, features: entry.features };
                }
            }
        }

        try {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                include: {
                    config: true,
                    features: true,
                },
            });

            if (!tenant || tenant.status !== 'ACTIVE') {
                return null;
            }

            const tenantContext: TenantContext = {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                status: tenant.status,
                config: tenant.config
                    ? {
                        businessName: tenant.config.businessName,
                        logoUrl: tenant.config.logoUrl || undefined,
                        primaryColor: tenant.config.primaryColor,
                        email: tenant.config.email || undefined,
                        phone: tenant.config.phone || undefined,
                        locale: tenant.config.locale,
                        currency: tenant.config.currency,
                        currencySymbol: tenant.config.currencySymbol,
                        timezone: tenant.config.timezone,
                    }
                    : undefined,
            };

            const features: TenantFeaturesContext = tenant.features
                ? {
                    catalogEnabled: tenant.features.catalogEnabled,
                    pricingEnabled: tenant.features.pricingEnabled,
                    bookingsEnabled: tenant.features.bookingsEnabled,
                    ecommerceEnabled: tenant.features.ecommerceEnabled,
                    supportEnabled: tenant.features.supportEnabled,
                    invoicingEnabled: tenant.features.invoicingEnabled,
                    cmsEnabled: tenant.features.cmsEnabled,
                    marketingEnabled: tenant.features.marketingEnabled,
                    reviewsEnabled: tenant.features.reviewsEnabled,
                    analyticsEnabled: tenant.features.analyticsEnabled,
                    aiEnabled: tenant.features.aiEnabled,
                }
                : DEFAULT_FEATURES;

            // Cache by tenant ID
            TenantMiddleware.tenantCache.set(`id:${tenantId}`, {
                tenant: tenantContext,
                features,
                expiresAt: Date.now() + this.CACHE_TTL_MS,
            });

            return { tenant: tenantContext, features };
        } catch (error) {
            this.logger.error(`Error resolving tenant by ID ${tenantId}:`, error);
            return null;
        }
    }
}
