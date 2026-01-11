import { Controller, Get, Param, Query } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { TenantId } from '../../core/tenancy';

@Controller('offerings')
export class OfferingsController {
    constructor(private readonly offeringsService: OfferingsService) { }

    /**
     * GET /offerings - List active offerings
     */
    @Get()
    findAll(@TenantId() tenantId: string, @Query('categoryId') categoryId?: string) {
        return this.offeringsService.findAllPublic(tenantId, categoryId);
    }

    /**
     * GET /offerings/categories - List category tree
     */
    @Get('categories')
    findCategories(@TenantId() tenantId: string) {
        return this.offeringsService.findCategoriesPublic(tenantId);
    }

    /**
     * GET /offerings/:slug - Get offering by slug
     */
    @Get(':slug')
    findOne(@TenantId() tenantId: string, @Param('slug') slug: string) {
        return this.offeringsService.findBySlug(tenantId, slug);
    }
}
