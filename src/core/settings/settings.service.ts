import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getAll(tenantId: string) {
        return this.prisma.setting.findMany({
            where: { tenantId },
            select: { key: true, value: true, updatedAt: true },
            orderBy: { key: 'asc' },
        });
    }

    async get<T = unknown>(tenantId: string, key: string): Promise<T | null> {
        const setting = await this.prisma.setting.findUnique({
            where: { tenantId_key: { tenantId, key } },
        });

        return setting?.value as T | null;
    }

    async set(tenantId: string, key: string, value: unknown) {
        return this.prisma.setting.upsert({
            where: { tenantId_key: { tenantId, key } },
            create: { tenantId, key, value: value as object },
            update: { value: value as object },
        });
    }

    async delete(tenantId: string, key: string) {
        const setting = await this.prisma.setting.findUnique({
            where: { tenantId_key: { tenantId, key } },
        });

        if (!setting) {
            throw new NotFoundException(`Setting '${key}' not found`);
        }

        return this.prisma.setting.delete({
            where: { tenantId_key: { tenantId, key } },
        });
    }

    // Global settings (tenantId = null)
    async getGlobal<T = unknown>(key: string): Promise<T | null> {
        const setting = await this.prisma.setting.findFirst({
            where: { tenantId: null, key },
        });

        return setting?.value as T | null;
    }

    async setGlobal(key: string, value: unknown) {
        return this.prisma.setting.upsert({
            where: { tenantId_key: { tenantId: '', key } }, // Prisma workaround for null
            create: { tenantId: undefined, key, value: value as object },
            update: { value: value as object },
        });
    }
}
