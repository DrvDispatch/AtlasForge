import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TenantMiddleware } from '../tenancy/tenant.middleware';

interface CreateTenantDto {
    name: string;
    slug: string;
    primaryDomain?: string;
    config?: {
        businessName: string;
        email?: string;
        phone?: string;
        primaryColor?: string;
        locale?: string;
        currency?: string;
        currencySymbol?: string;
        timezone?: string;
    };
    features?: {
        bookingsEnabled?: boolean;
        ecommerceEnabled?: boolean;
        supportEnabled?: boolean;
        invoicingEnabled?: boolean;
        aiEnabled?: boolean;
    };
}

@Injectable()
export class OwnerService {
    private readonly logger = new Logger(OwnerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
    ) { }

    // ============================================
    // Tenant Management
    // ============================================

    async listTenants(status?: string) {
        return this.prisma.tenant.findMany({
            where: status ? { status: status as 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'DRAFT' | 'SEEDING' } : undefined,
            include: {
                domains: true,
                config: { select: { businessName: true, email: true } },
                features: { select: { ecommerceEnabled: true, bookingsEnabled: true } },
                _count: { select: { users: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getTenant(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                domains: true,
                config: true,
                features: true,
                _count: { select: { users: true } },
            },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        return tenant;
    }

    async createTenant(dto: CreateTenantDto, ownerId: string) {
        // Check slug uniqueness
        const existing = await this.prisma.tenant.findUnique({
            where: { slug: dto.slug },
        });

        if (existing) {
            throw new ConflictException('Tenant slug already exists');
        }

        const tenant = await this.prisma.$transaction(async (tx) => {
            // Create tenant
            const newTenant = await tx.tenant.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    status: 'DRAFT',
                },
            });

            // Create config
            await tx.tenantConfig.create({
                data: {
                    tenantId: newTenant.id,
                    businessName: dto.config?.businessName || dto.name,
                    email: dto.config?.email,
                    phone: dto.config?.phone,
                    primaryColor: dto.config?.primaryColor || '#7c3aed',
                    locale: dto.config?.locale || 'en',
                    currency: dto.config?.currency || 'EUR',
                    currencySymbol: dto.config?.currencySymbol || '€',
                    timezone: dto.config?.timezone || 'Europe/Brussels',
                },
            });

            // Create features
            await tx.tenantFeature.create({
                data: {
                    tenantId: newTenant.id,
                    bookingsEnabled: dto.features?.bookingsEnabled ?? false,
                    ecommerceEnabled: dto.features?.ecommerceEnabled ?? false,
                    supportEnabled: dto.features?.supportEnabled ?? false,
                    invoicingEnabled: dto.features?.invoicingEnabled ?? false,
                    aiEnabled: dto.features?.aiEnabled ?? false,
                },
            });

            // Create primary domain if provided
            if (dto.primaryDomain) {
                await tx.tenantDomain.create({
                    data: {
                        tenantId: newTenant.id,
                        domain: dto.primaryDomain.toLowerCase(),
                        isPrimary: true,
                    },
                });
            }

            return newTenant;
        });

        // Audit
        await this.auditService.logOwner({
            ownerId,
            action: 'CREATE_TENANT',
            targetType: 'TENANT',
            targetId: tenant.id,
            metadata: { name: dto.name, slug: dto.slug },
        });

        return tenant;
    }

    async updateTenantStatus(
        tenantId: string,
        status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED',
        ownerId: string,
    ) {
        const tenant = await this.getTenant(tenantId);

        const updated = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                status,
                suspendedAt: status === 'SUSPENDED' ? new Date() : null,
                archivedAt: status === 'ARCHIVED' ? new Date() : null,
            },
        });

        // Invalidate cache
        TenantMiddleware.invalidateCache(tenantId);

        // Audit
        await this.auditService.logOwner({
            ownerId,
            action: `TENANT_${status}`,
            targetType: 'TENANT',
            targetId: tenantId,
            metadata: { previousStatus: tenant.status, newStatus: status },
        });

        return updated;
    }

    // ============================================
    // Domain Management
    // ============================================

    async addDomain(tenantId: string, domain: string, ownerId: string) {
        await this.getTenant(tenantId);

        const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

        // Check uniqueness
        const existing = await this.prisma.tenantDomain.findUnique({
            where: { domain: normalizedDomain },
        });

        if (existing) {
            throw new ConflictException('Domain already in use');
        }

        const newDomain = await this.prisma.tenantDomain.create({
            data: {
                tenantId,
                domain: normalizedDomain,
                isPrimary: false,
            },
        });

        await this.auditService.logOwner({
            ownerId,
            action: 'ADD_DOMAIN',
            targetType: 'DOMAIN',
            targetId: newDomain.id,
            metadata: { tenantId, domain: normalizedDomain },
        });

        return newDomain;
    }

    async removeDomain(domainId: string, ownerId: string) {
        const domain = await this.prisma.tenantDomain.findUnique({
            where: { id: domainId },
        });

        if (!domain) {
            throw new NotFoundException('Domain not found');
        }

        await this.prisma.tenantDomain.delete({
            where: { id: domainId },
        });

        TenantMiddleware.invalidateCache(domain.domain);

        await this.auditService.logOwner({
            ownerId,
            action: 'REMOVE_DOMAIN',
            targetType: 'DOMAIN',
            targetId: domainId,
            metadata: { tenantId: domain.tenantId, domain: domain.domain },
        });

        return { success: true };
    }

    // ============================================
    // Admin Provisioning
    // ============================================

    /**
     * Provision initial admin user for a tenant
     * Returns one-time credentials (must be shown once, then discarded)
     */
    async provisionAdmin(
        tenantId: string,
        dto: { email: string; name: string },
        ownerId: string,
    ) {
        const tenant = await this.getTenant(tenantId);

        // Check if admin already exists
        const existingAdmin = await this.prisma.user.findFirst({
            where: { tenantId, role: 'ADMIN' },
        });

        if (existingAdmin) {
            throw new ConflictException('Tenant already has an admin user');
        }

        // Generate one-time password
        const oneTimePassword = this.generateSecurePassword();

        // Hash password
        const hashedPassword = await bcrypt.hash(oneTimePassword, 10);

        // Create admin user
        const admin = await this.prisma.user.create({
            data: {
                tenant: { connect: { id: tenantId } },
                email: dto.email.toLowerCase(),
                name: dto.name,
                passwordHash: hashedPassword,
                role: 'ADMIN',
            },
        });

        // Audit
        await this.auditService.logOwner({
            ownerId,
            action: 'PROVISION_ADMIN',
            targetType: 'USER',
            targetId: admin.id,
            metadata: { tenantId, email: dto.email },
        });

        this.logger.log(`Provisioned admin ${dto.email} for tenant ${tenant.name}`);

        // Return credentials (one-time only!)
        return {
            userId: admin.id,
            email: admin.email,
            name: admin.name,
            oneTimePassword,
            message: 'Credentials shown once only. User must change password on first login.',
        };
    }

    private generateSecurePassword(): string {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // ============================================
    // Owner Audit Logs
    // ============================================

    async getAuditLogs(limit = 100) {
        return this.auditService.getOwnerLogs({ limit });
    }
}
