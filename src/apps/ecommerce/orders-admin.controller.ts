import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { TenantId } from '../../core/tenancy/tenant.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto';

interface RequestWithUser extends Request {
    user?: { id: string; name: string; email: string; role: string };
}

@ApiTags('OrdersAdmin')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class OrdersAdminController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    @ApiOperation({ summary: 'List all orders' })
    async findAll(
        @TenantId() tenantId: string,
        @Query('status') status?: string,
    ) {
        return this.ordersService.findAll(tenantId, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    async findOne(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.ordersService.findOne(tenantId, id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update order status' })
    async updateStatus(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
        @Req() req: RequestWithUser,
    ) {
        return this.ordersService.updateStatus(
            tenantId,
            id,
            dto,
            req.user?.id,
            req.user?.name || req.user?.email,
        );
    }
}
