import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferingDto, UpdateOfferingDto, CreateOfferingCategoryDto } from './dto';

@Injectable()
export class OfferingsService {
    private readonly logger = new Logger(OfferingsService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ==========================================
    // PUBLIC: Offerings
    // ==========================================

    /**
     * List active offerings for a tenant (public)
     */
    async findAllPublic(tenantId: string, categoryId?: string) {
        return this.prisma.offering.findMany({
            where: {
                tenantId,
                isActive: true,
                ...(categoryId ? { categoryId } : {}),
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                attributes: {
                    include: {
                        definition: { select: { key: true, label: true, type: true } },
                    },
                },
            },
            orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        });
    }

    /**
     * Get a single offering by slug (public)
     */
    async findBySlug(tenantId: string, slug: string) {
        const offering = await this.prisma.offering.findUnique({
            where: { tenantId_slug: { tenantId, slug } },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                attributes: {
                    include: {
                        definition: { select: { key: true, label: true, type: true } },
                    },
                },
            },
        });

        if (!offering || !offering.isActive) {
            throw new NotFoundException('Offering not found');
        }

        return offering;
    }

    // ==========================================
    // ADMIN: Offerings
    // ==========================================

    /**
     * List all offerings (admin, includes inactive)
     */
    async findAllAdmin(tenantId: string) {
        return this.prisma.offering.findMany({
            where: { tenantId },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }

    /**
     * Create offering (admin)
     */
    async create(tenantId: string, dto: CreateOfferingDto) {
        // Check slug uniqueness
        const existing = await this.prisma.offering.findUnique({
            where: { tenantId_slug: { tenantId, slug: dto.slug } },
        });
        if (existing) {
            throw new ConflictException(`Offering with slug "${dto.slug}" already exists`);
        }

        return this.prisma.offering.create({
            data: {
                tenantId,
                ...dto,
            },
        });
    }

    /**
     * Update offering (admin)
     */
    async update(tenantId: string, id: string, dto: UpdateOfferingDto) {
        const offering = await this.prisma.offering.findFirst({
            where: { id, tenantId },
        });
        if (!offering) {
            throw new NotFoundException('Offering not found');
        }

        // Check slug uniqueness if changing
        if (dto.slug && dto.slug !== offering.slug) {
            const existing = await this.prisma.offering.findUnique({
                where: { tenantId_slug: { tenantId, slug: dto.slug } },
            });
            if (existing) {
                throw new ConflictException(`Offering with slug "${dto.slug}" already exists`);
            }
        }

        return this.prisma.offering.update({
            where: { id },
            data: dto,
        });
    }

    /**
     * Delete offering (admin - soft delete via isActive = false)
     */
    async remove(tenantId: string, id: string) {
        const offering = await this.prisma.offering.findFirst({
            where: { id, tenantId },
        });
        if (!offering) {
            throw new NotFoundException('Offering not found');
        }

        return this.prisma.offering.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ==========================================
    // CATEGORIES
    // ==========================================

    /**
     * List categories (public - active only, tree structure)
     */
    async findCategoriesPublic(tenantId: string) {
        const categories = await this.prisma.offeringCategory.findMany({
            where: { tenantId, isActive: true, parentId: null },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return categories;
    }

    /**
     * Create category (admin)
     */
    async createCategory(tenantId: string, dto: CreateOfferingCategoryDto) {
        // Check slug uniqueness
        const existing = await this.prisma.offeringCategory.findUnique({
            where: { tenantId_slug: { tenantId, slug: dto.slug } },
        });
        if (existing) {
            throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
        }

        // Calculate depth
        let depth = 0;
        if (dto.parentId) {
            const parent = await this.prisma.offeringCategory.findUnique({
                where: { id: dto.parentId },
            });
            if (parent) {
                depth = parent.depth + 1;
            }
        }

        return this.prisma.offeringCategory.create({
            data: {
                tenantId,
                ...dto,
                depth,
            },
        });
    }
}
