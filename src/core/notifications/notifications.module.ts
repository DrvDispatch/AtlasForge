import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { OrderEmailService } from './order-email.service';

@Global()
@Module({
    providers: [
        EmailService,
        OrderEmailService,
    ],
    exports: [
        EmailService,
        OrderEmailService,
    ],
})
export class NotificationsModule { }
