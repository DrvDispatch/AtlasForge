import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [AuditModule],
    controllers: [OwnerController],
    providers: [OwnerService],
    exports: [OwnerService],
})
export class OwnerModule { }
