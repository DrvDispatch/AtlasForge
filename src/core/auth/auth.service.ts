import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';
import { AuthEmailService } from './services/auth-email.service';
import {
    RegisterDto,
    LoginDto,
    AuthResponseDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyEmailDto,
    ResendVerificationDto,
    MessageResponseDto,
} from './dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly tenancyService: TenancyService,
        private readonly authEmailService: AuthEmailService,
    ) { }

    // ============================================
    // Customer Registration & Login
    // ============================================

    async register(tenantId: string, dto: RegisterDto): Promise<AuthResponseDto> {
        // Check if user exists within this tenant
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email, tenantId },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const emailVerifyToken = randomBytes(32).toString('hex');

        // Create user
        const user = await this.prisma.user.create({
            data: {
                tenantId,
                email: dto.email,
                name: dto.name,
                passwordHash,
                phone: dto.phone,
                role: 'CUSTOMER',
                emailVerifyToken,
            },
        });

        // Send verification email
        this.authEmailService.sendVerificationEmail(
            { email: user.email, name: user.name },
            emailVerifyToken,
            tenantId,
        ).catch(err => this.logger.error(`Failed to send verification email: ${err}`));

        this.logger.log(`User registered: ${user.email} for tenant: ${tenantId}`);

        const accessToken = this.generateToken(user.id, user.email, user.role, tenantId);
        const refreshToken = await this.createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: false,
                avatar: user.avatar || undefined,
            },
        };
    }

    async login(tenantId: string, dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, tenantId },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        if (!user.passwordHash) {
            throw new UnauthorizedException('Please use Google to sign in');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.emailVerified) {
            throw new UnauthorizedException(
                'Please verify your email before signing in. Check your inbox for a verification link.',
            );
        }

        const accessToken = this.generateToken(user.id, user.email, user.role, tenantId);
        const refreshToken = await this.createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: true,
                avatar: user.avatar || undefined,
            },
        };
    }

    /**
     * Google OAuth login/registration
     * - If user exists with googleId: login
     * - If user exists with same email: link Google account and login
     * - Otherwise: create new user
     */
    async googleLogin(
        tenantId: string,
        profile: { googleId: string; email: string; name: string; avatar?: string },
    ): Promise<AuthResponseDto> {
        // First, check if user exists by googleId
        let user = await this.prisma.user.findFirst({
            where: { tenantId, googleId: profile.googleId },
        });

        if (!user) {
            // Check if user exists by email (link accounts)
            user = await this.prisma.user.findFirst({
                where: { tenantId, email: profile.email },
            });

            if (user) {
                // Link Google account to existing user
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: profile.googleId,
                        avatar: user.avatar || profile.avatar,
                        emailVerified: user.emailVerified || new Date(),
                    },
                });
                this.logger.log(`Linked Google account to existing user: ${user.email}`);
            }
        }

        if (!user) {
            // Create new user
            user = await this.prisma.user.create({
                data: {
                    tenantId,
                    email: profile.email,
                    name: profile.name,
                    googleId: profile.googleId,
                    avatar: profile.avatar,
                    role: 'CUSTOMER',
                    emailVerified: new Date(), // Google-verified emails are trusted
                },
            });
            this.logger.log(`Created Google user: ${user.email}`);
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        const accessToken = this.generateToken(user.id, user.email, user.role, tenantId);
        const refreshToken = await this.createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: true,
                avatar: user.avatar || undefined,
            },
        };
    }

    // ============================================
    // Admin & Owner Login
    // ============================================

    async adminLogin(
        email: string,
        password: string,
        tenantId?: string,
    ): Promise<AuthResponseDto> {
        // For tenant-specific admin login, or platform-level admin login
        const user = tenantId
            ? await this.prisma.user.findFirst({
                where: {
                    email,
                    tenantId,
                    role: { in: ['ADMIN', 'STAFF'] },
                },
            })
            : await this.prisma.user.findFirst({
                where: {
                    email,
                    tenantId: null,
                    role: { in: ['ADMIN', 'OWNER'] },
                },
            });

        if (!user || !user.isActive || !user.passwordHash) {
            throw new UnauthorizedException('Invalid admin credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid admin credentials');
        }

        const accessToken = this.generateToken(user.id, user.email, user.role, user.tenantId);
        const refreshToken = await this.createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: !!user.emailVerified,
                avatar: user.avatar || undefined,
            },
        };
    }

    async ownerLogin(email: string, password: string): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                role: 'OWNER',
                tenantId: null,
            },
        });

        if (!user || !user.isActive || !user.passwordHash) {
            throw new UnauthorizedException('Invalid owner credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid owner credentials');
        }

        const accessToken = this.generateToken(user.id, user.email, user.role, null);
        const refreshToken = await this.createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: !!user.emailVerified,
                avatar: user.avatar || undefined,
            },
        };
    }

    // ============================================
    // Email Verification
    // ============================================

    async verifyEmail(dto: VerifyEmailDto): Promise<MessageResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: { emailVerifyToken: dto.token },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                emailVerifyToken: null,
            },
        });

        return { message: 'Email verified successfully', success: true };
    }

    async resendVerification(
        tenantId: string,
        dto: ResendVerificationDto,
    ): Promise<MessageResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, tenantId },
        });

        if (!user) {
            return {
                message: 'If an account exists with this email, a verification link has been sent',
                success: true,
            };
        }

        if (user.emailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        const emailVerifyToken = randomBytes(32).toString('hex');

        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerifyToken },
        });

        // Send verification email
        this.authEmailService.sendVerificationEmail(
            { email: user.email, name: user.name },
            emailVerifyToken,
            tenantId,
        ).catch(err => this.logger.error(`Failed to send verification email: ${err}`));

        return {
            message: 'If an account exists with this email, a verification link has been sent',
            success: true,
        };
    }

    // ============================================
    // Password Reset
    // ============================================

    async forgotPassword(tenantId: string, dto: ForgotPasswordDto): Promise<MessageResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, tenantId },
        });

        if (!user) {
            return {
                message: 'If an account exists with this email, a password reset link has been sent',
                success: true,
            };
        }

        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        // Send password reset email
        this.authEmailService.sendPasswordResetEmail(
            { email: user.email, name: user.name },
            resetToken,
            tenantId,
        ).catch(err => this.logger.error(`Failed to send password reset email: ${err}`));

        return {
            message: 'If an account exists with this email, a password reset link has been sent',
            success: true,
        };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: dto.token,
                resetTokenExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return { message: 'Password reset successfully', success: true };
    }

    // ============================================
    // Token Management
    // ============================================

    async validateUser(userId: string) {
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
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }

    /**
     * Refresh access token with token rotation
     * - Issues new access token
     * - Rotates refresh token (old one revoked, new one issued)
     * - Detects token reuse (potential theft)
     */
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Token reuse detection: if already revoked, someone is using a stolen token
        if (storedToken.revokedAt) {
            this.logger.warn(`Token reuse detected for user: ${storedToken.userId}`);
            // Revoke all tokens for this user (security measure)
            await this.prisma.refreshToken.updateMany({
                where: { userId: storedToken.userId },
                data: { revokedAt: new Date() },
            });
            throw new UnauthorizedException('Token reuse detected - all sessions revoked');
        }

        if (storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        const { user } = storedToken;

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Revoke old token
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });

        // Issue new tokens
        const accessToken = this.generateToken(user.id, user.email, user.role, user.tenantId);
        const newRefreshToken = await this.createRefreshToken(user.id);

        this.logger.debug(`Token rotated for user: ${user.email}`);

        return { accessToken, refreshToken: newRefreshToken };
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { token, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    /**
     * Revoke all refresh tokens for a user (e.g., password change, security breach)
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        this.logger.log(`All tokens revoked for user: ${userId}`);
    }

    // ============================================
    // OAuth Handoff (for cross-domain auth)
    // ============================================

    async createHandoffCode(userId: string, tenantId: string, returnPath: string): Promise<string> {
        const code = randomBytes(32).toString('base64url');

        await this.prisma.oAuthHandoffCode.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });

        await this.prisma.oAuthHandoffCode.create({
            data: {
                code,
                userId,
                tenantId,
                returnPath,
                expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds
            },
        });

        return code;
    }

    async exchangeHandoffCode(
        code: string,
        tenantId: string,
    ): Promise<{ accessToken: string; returnPath: string; user: { id: string; email: string; name: string } } | null> {
        const handoff = await this.prisma.oAuthHandoffCode.findUnique({
            where: { code },
        });

        if (!handoff || handoff.expiresAt < new Date() || handoff.usedAt || handoff.tenantId !== tenantId) {
            return null;
        }

        await this.prisma.oAuthHandoffCode.update({
            where: { id: handoff.id },
            data: { usedAt: new Date() },
        });

        const user = await this.prisma.user.findUnique({
            where: { id: handoff.userId },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!user) {
            return null;
        }

        const accessToken = this.generateToken(user.id, user.email, user.role, tenantId);

        return {
            accessToken,
            returnPath: handoff.returnPath,
            user: { id: user.id, email: user.email, name: user.name },
        };
    }

    // ============================================
    // Impersonation (Owner only)
    // ============================================

    /**
     * Start impersonation of a tenant user (OWNER only)
     * Returns a token that allows the owner to act as the target user
     */
    async startImpersonation(
        ownerId: string,
        targetUserId: string,
        targetTenantId: string,
    ): Promise<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }> {
        // Verify owner exists and is OWNER role
        const owner = await this.prisma.user.findUnique({
            where: { id: ownerId },
            select: { id: true, role: true },
        });

        if (!owner || owner.role !== 'OWNER') {
            throw new UnauthorizedException('Only platform owners can impersonate users');
        }

        // Find target user
        const targetUser = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, email: true, name: true, role: true, tenantId: true, isActive: true },
        });

        if (!targetUser) {
            throw new BadRequestException('Target user not found');
        }

        if (!targetUser.isActive) {
            throw new BadRequestException('Cannot impersonate inactive user');
        }

        if (targetUser.tenantId !== targetTenantId) {
            throw new BadRequestException('User does not belong to specified tenant');
        }

        // Cannot impersonate other owners
        if (targetUser.role === 'OWNER') {
            throw new BadRequestException('Cannot impersonate other owners');
        }

        // Generate impersonation token
        const accessToken = this.generateToken(
            targetUser.id,
            targetUser.email,
            targetUser.role,
            targetUser.tenantId,
            { isImpersonating: true, impersonatedBy: ownerId },
        );

        this.logger.log(`Owner ${ownerId} started impersonating user ${targetUser.email}`);

        return {
            accessToken,
            user: {
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.name,
                role: targetUser.role,
            },
        };
    }

    /**
     * End impersonation and return to owner session
     */
    async endImpersonation(ownerId: string): Promise<{ accessToken: string }> {
        const owner = await this.prisma.user.findUnique({
            where: { id: ownerId },
            select: { id: true, email: true, role: true },
        });

        if (!owner || owner.role !== 'OWNER') {
            throw new UnauthorizedException('Invalid owner');
        }

        // Generate fresh owner token (no impersonation)
        const accessToken = this.generateToken(owner.id, owner.email, owner.role, null);

        this.logger.log(`Owner ${ownerId} ended impersonation`);

        return { accessToken };
    }

    // ============================================
    // Private Helpers
    // ============================================

    private generateToken(
        userId: string,
        email: string,
        role: string,
        tenantId: string | null,
        impersonation?: { isImpersonating: boolean; impersonatedBy: string },
    ): string {
        const payload: Record<string, unknown> = { sub: userId, email, role, tenantId };

        if (impersonation) {
            payload.isImpersonating = impersonation.isImpersonating;
            payload.impersonatedBy = impersonation.impersonatedBy;
        }

        return this.jwtService.sign(payload);
    }

    private async createRefreshToken(userId: string): Promise<string> {
        const token = randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await this.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        });

        return token;
    }
}

