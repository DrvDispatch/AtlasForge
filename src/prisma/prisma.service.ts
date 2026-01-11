import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        // Prisma 7 requires adapter for direct database connections
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Prisma connected to database');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    /**
     * Clean database for testing purposes (test environment only)
     */
    async cleanDatabase() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('cleanDatabase is only available in test environment');
        }

        const tablenames = await this.$queryRaw<
            Array<{ tablename: string }>
        >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

        const tables = tablenames
            .map(({ tablename }) => tablename)
            .filter((name) => name !== '_prisma_migrations')
            .map((name) => `"public"."${name}"`)
            .join(', ');

        if (tables.length > 0) {
            await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        }
    }
}

