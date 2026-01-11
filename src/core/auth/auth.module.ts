import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOAuthService } from './services/google-oauth.service';
import { AuthEmailService } from './services/auth-email.service';
import { AuthAuditService } from './services/auth-audit.service';
import { TenancyModule } from '../tenancy/tenancy.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): JwtModuleOptions => ({
                secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
                signOptions: {
                    expiresIn: 900, // 15 minutes in seconds
                },
            }),
        }),
        TenancyModule,
        NotificationsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleOAuthService, AuthEmailService, AuthAuditService],
    exports: [AuthService, JwtModule, GoogleOAuthService, AuthEmailService, AuthAuditService],
})
export class AuthModule { }

