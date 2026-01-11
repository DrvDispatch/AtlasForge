import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OwnerService } from './owner.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser, AuthenticatedUser } from '../auth/decorators';

@ApiTags('owner')
@Controller('owner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerController {
    private readonly logger = new Logger(OwnerController.name);

    constructor(private readonly ownerService: OwnerService) { }

    // ============================================
    // Tenant Management
    // ============================================

    @Get('tenants')
    @ApiOperation({ summary: 'List all tenants' })
    async listTenants(@Query('status') status?: string) {
        return this.ownerService.listTenants(status);
    }

    @Get('tenants/:id')
    @ApiOperation({ summary: 'Get tenant details' })
    async getTenant(@Param('id') id: string) {
        return this.ownerService.getTenant(id);
    }

    @Post('tenants')
    @ApiOperation({ summary: 'Create a new tenant' })
    async createTenant(
        @Body()
        dto: {
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
        },
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.ownerService.createTenant(dto, user.id);
    }

    @Patch('tenants/:id/status')
    @ApiOperation({ summary: 'Update tenant status' })
    async updateTenantStatus(
        @Param('id') id: string,
        @Body('status') status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED',
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.ownerService.updateTenantStatus(id, status, user.id);
    }

    // ============================================
    // Domain Management
    // ============================================

    @Post('tenants/:id/domains')
    @ApiOperation({ summary: 'Add domain to tenant' })
    async addDomain(
        @Param('id') tenantId: string,
        @Body('domain') domain: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.ownerService.addDomain(tenantId, domain, user.id);
    }

    @Delete('domains/:id')
    @ApiOperation({ summary: 'Remove domain' })
    async removeDomain(@Param('id') domainId: string, @CurrentUser() user: AuthenticatedUser) {
        return this.ownerService.removeDomain(domainId, user.id);
    }

    // ============================================
    // Admin Provisioning
    // ============================================

    @Post('tenants/:id/provision-admin')
    @ApiOperation({ summary: 'Provision initial admin for tenant' })
    async provisionAdmin(
        @Param('id') tenantId: string,
        @Body() dto: { email: string; name: string },
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.ownerService.provisionAdmin(tenantId, dto, user.id);
    }

    // ============================================
    // Audit Logs
    // ============================================

    @Get('audit-logs')
    @ApiOperation({ summary: 'Get owner audit logs' })
    async getAuditLogs(@Query('limit') limit?: number) {
        return this.ownerService.getAuditLogs(limit);
    }
}
