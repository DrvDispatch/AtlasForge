import { Controller, Post, Body, Get, UseGuards, Logger, Query, Res, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import {
    RegisterDto,
    LoginDto,
    AdminLoginDto,
    OwnerLoginDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyEmailDto,
    ResendVerificationDto,
    AuthResponseDto,
    MessageResponseDto,
} from './dto';
import { TenantId } from '../tenancy/tenant.decorator';
import { CurrentUser, AuthenticatedUser } from './decorators';
import { JwtAuthGuard } from './guards';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'strict' as const : 'lax' as const,
    path: '/',
};

@ApiTags('auth')
@Controller('auth')
@Throttle({ auth: { limit: 5, ttl: 60000 } })
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly googleOAuthService: GoogleOAuthService,
    ) { }

    /**
     * Set auth cookies on response
     */
    private setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
        // Access token: 15 minutes
        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });

        if (refreshToken) {
            // Refresh token: 7 days
            res.cookie('refreshToken', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
    }

    /**
     * Clear auth cookies
     */
    private clearAuthCookies(res: Response): void {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }

    // ============================================
    // Public Customer Routes
    // ============================================

    @Post('register')
    @ApiOperation({ summary: 'Register a new customer account' })
    @ApiResponse({ status: 201, type: AuthResponseDto })
    async register(
        @TenantId() tenantId: string,
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        this.logger.log(`Registration attempt for: ${dto.email}`);
        const result = await this.authService.register(tenantId, dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return result;
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async login(
        @TenantId() tenantId: string,
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const result = await this.authService.login(tenantId, dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return result;
    }

    @Post('verify-email')
    @ApiOperation({ summary: 'Verify email with token' })
    async verifyEmail(@Body() dto: VerifyEmailDto): Promise<MessageResponseDto> {
        return this.authService.verifyEmail(dto);
    }

    @Post('resend-verification')
    @ApiOperation({ summary: 'Resend verification email' })
    async resendVerification(
        @TenantId() tenantId: string,
        @Body() dto: ResendVerificationDto,
    ): Promise<MessageResponseDto> {
        return this.authService.resendVerification(tenantId, dto);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    async forgotPassword(
        @TenantId() tenantId: string,
        @Body() dto: ForgotPasswordDto,
    ): Promise<MessageResponseDto> {
        return this.authService.forgotPassword(tenantId, dto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
        return this.authService.resetPassword(dto);
    }

    // ============================================
    // Google OAuth
    // ============================================

    @Get('google')
    @ApiOperation({ summary: 'Initiate Google OAuth flow' })
    async googleAuth(
        @TenantId() tenantId: string,
        @Query('returnUrl') returnUrl: string = '/',
        @Res() res: Response,
    ) {
        if (!this.googleOAuthService.isEnabled()) {
            throw new BadRequestException('Google OAuth is not configured');
        }

        const state = this.googleOAuthService.createOAuthState(tenantId, returnUrl);
        const authUrl = this.googleOAuthService.generateAuthUrl(state);

        this.logger.log(`Redirecting to Google OAuth for tenant: ${tenantId}`);
        res.redirect(authUrl);
    }

    @Get('google/callback')
    @ApiOperation({ summary: 'Google OAuth callback' })
    async googleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Query('error') error: string,
        @Res() res: Response,
    ) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        if (error) {
            this.logger.warn(`Google OAuth error: ${error}`);
            return res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
        }

        if (!code || !state) {
            return res.redirect(`${frontendUrl}/auth/login?error=missing_params`);
        }

        const stateData = this.googleOAuthService.getStateData(state);
        if (!stateData) {
            return res.redirect(`${frontendUrl}/auth/login?error=invalid_state`);
        }

        try {
            const googleProfile = await this.googleOAuthService.handleCallback(code);
            const authResult = await this.authService.googleLogin(stateData.tenantId, googleProfile);

            // Set cookies and redirect
            this.setAuthCookies(res, authResult.accessToken, authResult.refreshToken || undefined);
            res.redirect(`${frontendUrl}${stateData.returnUrl}`);
        } catch (err) {
            this.logger.error(`Google OAuth callback error: ${err}`);
            return res.redirect(`${frontendUrl}/auth/login?error=authentication_failed`);
        }
    }

    // ============================================
    // Admin Routes
    // ============================================

    @Post('admin-login')
    @ApiOperation({ summary: 'Login as tenant admin/staff' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async adminLogin(
        @TenantId() tenantId: string,
        @Body() dto: AdminLoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const result = await this.authService.adminLogin(dto.email, dto.password, tenantId);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return result;
    }

    // ============================================
    // Owner Routes (platform-level)
    // ============================================

    @Post('owner-login')
    @ApiOperation({ summary: 'Login as platform owner' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async ownerLogin(
        @Body() dto: OwnerLoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const result = await this.authService.ownerLogin(dto.email, dto.password);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return result;
    }

    // ============================================
    // Token Management
    // ============================================

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token with token rotation' })
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new BadRequestException('No refresh token provided');
        }

        const result = await this.authService.refreshAccessToken(refreshToken);
        // Set both new access and refresh token (rotation)
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return { success: true };
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout and revoke refresh token' })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<MessageResponseDto> {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }
        this.clearAuthCookies(res);
        return { message: 'Logged out successfully', success: true };
    }

    // ============================================
    // Current User
    // ============================================

    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            emailVerified: user.emailVerified,
            avatar: user.avatar,
            isImpersonating: user.isImpersonating || false,
            impersonatedBy: user.impersonatedBy || null,
        };
    }

    // ============================================
    // Impersonation (Owner only)
    // ============================================

    @Post('impersonate')
    @ApiOperation({ summary: 'Start impersonating a tenant user (owner only)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async startImpersonation(
        @CurrentUser() owner: AuthenticatedUser,
        @Body('userId') targetUserId: string,
        @Body('tenantId') targetTenantId: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.startImpersonation(
            owner.id,
            targetUserId,
            targetTenantId,
        );

        // Set impersonation token (short-lived, no refresh token for impersonation)
        this.setAuthCookies(res, result.accessToken);

        return {
            success: true,
            user: result.user,
            message: `Now impersonating ${result.user.email}`,
        };
    }

    @Post('end-impersonate')
    @ApiOperation({ summary: 'End impersonation and return to owner session' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async endImpersonation(
        @CurrentUser() user: AuthenticatedUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        if (!user.isImpersonating || !user.impersonatedBy) {
            throw new BadRequestException('Not currently impersonating');
        }

        const result = await this.authService.endImpersonation(user.impersonatedBy);
        this.setAuthCookies(res, result.accessToken);

        return {
            success: true,
            message: 'Impersonation ended',
        };
    }
}

