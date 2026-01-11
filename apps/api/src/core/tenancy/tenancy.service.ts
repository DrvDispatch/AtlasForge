import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantMiddleware } from './tenant.middleware';

@Injectable()
export class TenancyService {
    private readonly logger = new Logger(TenancyService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get public config for a tenant (safe to expose to frontend)
     */
    async getPublicConfig(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                config: true,
                features: true,
                domains: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        return {
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                status: tenant.status,
            },
            branding: tenant.config
                ? {
                    businessName: tenant.config.businessName,
                    logoUrl: tenant.config.logoUrl,
                    faviconUrl: tenant.config.faviconUrl,
                    primaryColor: tenant.config.primaryColor,
                    secondaryColor: tenant.config.secondaryColor,
                    accentColor: tenant.config.accentColor,
                    borderRadius: tenant.config.borderRadius,
                    darkMode: tenant.config.darkMode,
                }
                : null,
            contact: tenant.config
                ? {
                    email: tenant.config.email,
                    phone: tenant.config.phone,
                    whatsappNumber: tenant.config.whatsappNumber,
                    address: tenant.config.address,
                }
                : null,
            regional: tenant.config
                ? {
                    locale: tenant.config.locale,
                    currency: tenant.config.currency,
                    currencySymbol: tenant.config.currencySymbol,
                    timezone: tenant.config.timezone,
                }
                : null,
            seo: tenant.config
                ? {
                    title: tenant.config.seoTitle,
                    description: tenant.config.seoDescription,
                }
                : null,
            features: tenant.features
                ? {
                    catalog: tenant.features.catalogEnabled,
                    pricing: tenant.features.pricingEnabled,
                    bookings: tenant.features.bookingsEnabled,
                    ecommerce: tenant.features.ecommerceEnabled,
                    support: tenant.features.supportEnabled,
                    cms: tenant.features.cmsEnabled,
                    reviews: tenant.features.reviewsEnabled,
                }
                : null,
            skin: tenant.config
                ? {
                    name: tenant.config.skinName,
                    frontendUrl: tenant.config.frontendUrl,
                }
                : { name: 'minimal', frontendUrl: null },
            primaryDomain: tenant.domains[0]?.domain || null,
        };
    }

    /**
     * Get the full domain URL for a tenant (for email links, etc.)
     */
    async getFullDomainUrl(tenantId: string): Promise<string> {
        const domain = await this.prisma.tenantDomain.findFirst({
            where: { tenantId, isPrimary: true },
        });

        if (!domain) {
            // Fallback to any domain
            const anyDomain = await this.prisma.tenantDomain.findFirst({
                where: { tenantId },
            });

            if (!anyDomain) {
                throw new NotFoundException('No domain configured for tenant');
            }

            return `https://${anyDomain.domain}`;
        }

        return `https://${domain.domain}`;
    }

    /**
     * Find tenant by domain (for OAuth callbacks, etc.)
     */
    async findTenantByDomain(domain: string): Promise<{ id: string } | null> {
        const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

        const tenantDomain = await this.prisma.tenantDomain.findFirst({
            where: { domain: normalizedDomain },
            include: { tenant: { select: { id: true, status: true } } },
        });

        if (!tenantDomain || tenantDomain.tenant.status !== 'ACTIVE') {
            return null;
        }

        return { id: tenantDomain.tenant.id };
    }

    /**
     * Check if a feature is enabled for a tenant
     */
    async isFeatureEnabled(
        tenantId: string,
        feature: keyof NonNullable<
            Awaited<ReturnType<typeof this.prisma.tenantFeature.findUnique>>
        >,
    ): Promise<boolean> {
        const features = await this.prisma.tenantFeature.findUnique({
            where: { tenantId },
        });

        if (!features) {
            return false;
        }

        const value = features[feature];
        return typeof value === 'boolean' ? value : false;
    }

    /**
     * Invalidate tenant cache (call after config/status changes)
     */
    invalidateCache(tenantId: string) {
        TenantMiddleware.invalidateCache(tenantId);
        this.logger.log(`Cache invalidated for tenant: ${tenantId}`);
    }
}
