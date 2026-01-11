import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tenantId?: string | null;
    isImpersonating?: boolean;
    impersonatedBy?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Cookie extraction (primary for browser)
                (request) => request?.cookies?.accessToken || null,
                // Authorization header (for API clients)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
            passReqToCallback: true,
        });
    }

    async validate(request: Request & { tenantId?: string }, payload: JwtPayload) {
        // OWNER role has platform-level access
        if (payload.role === 'OWNER') {
            const user = await this.getUserById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            return {
                ...user,
                tenantId: null,
                isImpersonating: payload.isImpersonating || false,
                impersonatedBy: payload.impersonatedBy || null,
            };
        }

        // Regular users
        const user = await this.getUserById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Validate token's tenantId matches the request's tenantId
        const requestTenantId = request?.tenantId;
        const tokenTenantId = payload.tenantId ?? user.tenantId;

        if (requestTenantId && !payload.isImpersonating) {
            if (tokenTenantId !== requestTenantId) {
                throw new UnauthorizedException('Session not valid for this tenant');
            }
        }

        // Update lastActiveAt (fire and forget)
        this.prisma.user
            .update({
                where: { id: payload.sub },
                data: { lastActiveAt: new Date() },
            })
            .catch(() => { });

        return {
            ...user,
            tenantId: tokenTenantId ?? null,
            isImpersonating: payload.isImpersonating || false,
            impersonatedBy: payload.impersonatedBy || null,
        };
    }

    private async getUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                emailVerified: true,
                avatar: true,
                tenantId: true,
            },
        });

        if (!user || !user.isActive) {
            return null;
        }

        return {
            ...user,
            emailVerified: !!user.emailVerified,
        };
    }
}
