import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { TenantId } from '../../core/tenancy';
import { JwtAuthGuard, RolesGuard, Roles } from '../../core/auth';
import { CreateOfferingDto, UpdateOfferingDto, CreateOfferingCategoryDto } from './dto';

@Controller('admin/offerings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class OfferingsAdminController {
    constructor(private readonly offeringsService: OfferingsService) { }

    /**
     * GET /admin/offerings - List all offerings (includes inactive)
     */
    @Get()
    findAll(@TenantId() tenantId: string) {
        return this.offeringsService.findAllAdmin(tenantId);
    }

    /**
     * POST /admin/offerings - Create offering
     */
    @Post()
    @Roles('ADMIN')
    create(@TenantId() tenantId: string, @Body() dto: CreateOfferingDto) {
        return this.offeringsService.create(tenantId, dto);
    }

    /**
     * PATCH /admin/offerings/:id - Update offering
     */
    @Patch(':id')
    @Roles('ADMIN')
    update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateOfferingDto,
    ) {
        return this.offeringsService.update(tenantId, id, dto);
    }

    /**
     * DELETE /admin/offerings/:id - Soft-delete offering
     */
    @Delete(':id')
    @Roles('ADMIN')
    remove(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.offeringsService.remove(tenantId, id);
    }

    /**
     * POST /admin/offerings/categories - Create category
     */
    @Post('categories')
    @Roles('ADMIN')
    createCategory(@TenantId() tenantId: string, @Body() dto: CreateOfferingCategoryDto) {
        return this.offeringsService.createCategory(tenantId, dto);
    }
}
