import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenancyService } from './tenancy.service';
import { TenantId } from './tenant.decorator';

@ApiTags('core')
@Controller('public/config')
export class TenancyController {
    private readonly logger = new Logger(TenancyController.name);

    constructor(private readonly tenancyService: TenancyService) { }

    @Get()
    @ApiOperation({ summary: 'Get public tenant configuration' })
    @ApiResponse({ status: 200, description: 'Tenant configuration returned' })
    @ApiResponse({ status: 404, description: 'Tenant not found' })
    async getPublicConfig(@TenantId() tenantId: string) {
        this.logger.log(`Fetching public config for tenant: ${tenantId}`);
        return this.tenancyService.getPublicConfig(tenantId);
    }
}
