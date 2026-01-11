import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, Prisma } from '../../generated/prisma/client';

export interface AuditLogEntry {
    tenantId?: string;
    userId: string;
    userName: string;
    userRole: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    entityName?: string;
    description: string;
    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
}

export interface OwnerAuditEntry {
    ownerId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Log a tenant-level audit event
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            await this.prisma.auditLog.create({
                data: {
                    tenantId: entry.tenantId,
                    userId: entry.userId,
                    userName: entry.userName,
                    userRole: entry.userRole,
                    action: entry.action,
                    entityType: entry.entityType,
                    entityId: entry.entityId,
                    entityName: entry.entityName,
                    description: entry.description,
                    oldValue: entry.oldValue,
                    newValue: entry.newValue,
                    metadata: entry.metadata,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                },
            });
        } catch (error) {
            this.logger.error('Failed to create audit log', error);
        }
    }

    /**
     * Log an owner-level (platform) audit event
     */
    async logOwner(entry: OwnerAuditEntry): Promise<void> {
        try {
            await this.prisma.ownerAuditLog.create({
                data: {
                    ownerId: entry.ownerId,
                    action: entry.action,
                    targetType: entry.targetType,
                    targetId: entry.targetId,
                    metadata: entry.metadata,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                },
            });
        } catch (error) {
            this.logger.error('Failed to create owner audit log', error);
        }
    }

    /**
     * Get audit logs for a tenant
     */
    async getTenantLogs(
        tenantId: string,
        options?: { action?: AuditAction; entityType?: string; limit?: number },
    ) {
        return this.prisma.auditLog.findMany({
            where: {
                tenantId,
                ...(options?.action && { action: options.action }),
                ...(options?.entityType && { entityType: options.entityType }),
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit ?? 100,
        });
    }

    /**
     * Get owner-level audit logs
     */
    async getOwnerLogs(options?: { action?: string; targetType?: string; limit?: number }) {
        return this.prisma.ownerAuditLog.findMany({
            where: {
                ...(options?.action && { action: options.action }),
                ...(options?.targetType && { targetType: options.targetType }),
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit ?? 100,
        });
    }
}
