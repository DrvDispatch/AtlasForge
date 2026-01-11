import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(tenantId: string, options?: { role?: string; isVip?: boolean }) {
        return this.prisma.user.findMany({
            where: {
                tenantId,
                ...(options?.role && { role: options.role as 'CUSTOMER' | 'STAFF' | 'ADMIN' }),
                ...(options?.isVip !== undefined && { isVip: options.isVip }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                isVip: true,
                totalSpent: true,
                lastActiveAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, userId: string) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenantId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                isVip: true,
                adminNotes: true,
                totalSpent: true,
                emailVerified: true,
                lastActiveAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(tenantId: string, userId: string, data: Partial<{ name: string; phone: string; isVip: boolean; adminNotes: string }>) {
        await this.findOne(tenantId, userId);

        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isVip: true,
                adminNotes: true,
            },
        });
    }

    async deactivate(tenantId: string, userId: string) {
        await this.findOne(tenantId, userId);

        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }

    async toggleVip(tenantId: string, userId: string, isVip: boolean) {
        await this.findOne(tenantId, userId);

        return this.prisma.user.update({
            where: { id: userId },
            data: { isVip },
        });
    }
}
