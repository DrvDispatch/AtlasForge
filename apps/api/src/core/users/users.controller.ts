import { Controller, Get, Param, Patch, Delete, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { TenantId } from '../tenancy/tenant.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@ApiTags('users')
@Controller('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users for tenant' })
    async findAll(
        @TenantId() tenantId: string,
        @Query('role') role?: string,
        @Query('isVip') isVip?: boolean,
    ) {
        return this.usersService.findAll(tenantId, { role, isVip });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.usersService.findOne(tenantId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() data: { name?: string; phone?: string; adminNotes?: string },
    ) {
        return this.usersService.update(tenantId, id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate user' })
    async deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.usersService.deactivate(tenantId, id);
    }

    @Patch(':id/vip')
    @ApiOperation({ summary: 'Toggle VIP status' })
    async toggleVip(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body('isVip') isVip: boolean,
    ) {
        return this.usersService.toggleVip(tenantId, id, isVip);
    }
}
