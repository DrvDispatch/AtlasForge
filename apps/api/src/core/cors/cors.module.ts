import { Module, Global } from '@nestjs/common';
import { CorsConfigService } from './cors-config.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [CorsConfigService],
    exports: [CorsConfigService],
})
export class CorsModule { }
