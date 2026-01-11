import { Controller, Get, Put, Delete, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { TenantId } from '../tenancy/tenant.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@ApiTags('settings')
@Controller('admin/settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class SettingsController {
    private readonly logger = new Logger(SettingsController.name);

    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all settings for tenant' })
    async getAll(@TenantId() tenantId: string) {
        return this.settingsService.getAll(tenantId);
    }

    @Get(':key')
    @ApiOperation({ summary: 'Get a specific setting' })
    async get(@TenantId() tenantId: string, @Param('key') key: string) {
        const value = await this.settingsService.get(tenantId, key);
        return { key, value };
    }

    @Put(':key')
    @ApiOperation({ summary: 'Set a setting value' })
    async set(
        @TenantId() tenantId: string,
        @Param('key') key: string,
        @Body('value') value: unknown,
    ) {
        return this.settingsService.set(tenantId, key, value);
    }

    @Delete(':key')
    @ApiOperation({ summary: 'Delete a setting' })
    async delete(@TenantId() tenantId: string, @Param('key') key: string) {
        return this.settingsService.delete(tenantId, key);
    }
}
