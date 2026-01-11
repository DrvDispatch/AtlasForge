import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';

/**
 * Order Email Templates
 * 
 * Sends transactional emails for orders:
 * - Order confirmation
 * - Order status updates
 */
@Injectable()
export class OrderEmailService {
    private readonly logger = new Logger(OrderEmailService.name);

    constructor(private readonly emailService: EmailService) { }

    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(order: {
        tenantId: string;
        orderNumber: string;
        customerEmail: string;
        customerName: string;
        items: Array<{ offeringName: string; quantity: number; priceCents: number }>;
        totalCents: number;
        currency: string;
    }) {
        const branding = await this.emailService.getTenantBranding(order.tenantId);

        const itemsHtml = order.items
            .map(item => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.offeringName}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.priceCents * item.quantity, order.currency)}</td>
                </tr>
            `)
            .join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: ${branding.primaryColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .order-table th { background: #f3f4f6; padding: 10px; text-align: left; }
                    .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${branding.logo ? `<img src="${branding.logo}" alt="${branding.businessName}" height="40" />` : ''}
                        <h1 style="margin: 10px 0 0;">Order Confirmation</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${order.customerName},</p>
                        <p>Thank you for your order! We've received your order <strong>#${order.orderNumber}</strong>.</p>
                        
                        <table class="order-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div class="total">
                            Total: ${this.formatPrice(order.totalCents, order.currency)}
                        </div>
                        
                        <p>We'll send you an update when your order is on its way.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${branding.businessName}. All rights reserved.</p>
                        <p>Questions? Contact us at <a href="mailto:${branding.supportEmail}">${branding.supportEmail}</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await this.emailService.send({
            to: order.customerEmail,
            subject: `Order Confirmation #${order.orderNumber}`,
            html,
            tags: [
                { name: 'category', value: 'order_confirmation' },
                { name: 'order_number', value: order.orderNumber },
            ],
        });
    }

    /**
     * Send order status update email
     */
    async sendStatusUpdate(order: {
        tenantId: string;
        orderNumber: string;
        customerEmail: string;
        customerName: string;
        previousStatus: string;
        newStatus: string;
    }) {
        const branding = await this.emailService.getTenantBranding(order.tenantId);

        const statusMessages: Record<string, string> = {
            PAID: 'Your payment has been received! We\'re now processing your order.',
            PROCESSING: 'Good news! Your order is now being processed.',
            SHIPPED: 'Your order is on its way! 📦',
            COMPLETED: 'Your order has been delivered. Thank you for shopping with us!',
            CANCELLED: 'Your order has been cancelled. If you have any questions, please contact us.',
            REFUNDED: 'Your refund has been processed. The amount will appear in your account shortly.',
        };

        const message = statusMessages[order.newStatus] || `Your order status has been updated to: ${order.newStatus}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: ${branding.primaryColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                    .status-badge { display: inline-block; padding: 8px 16px; background: ${branding.primaryColor}; color: white; border-radius: 20px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Order Update</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${order.customerName},</p>
                        <p>There's an update on your order <strong>#${order.orderNumber}</strong>:</p>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <span class="status-badge">${order.newStatus}</span>
                        </p>
                        
                        <p>${message}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${branding.businessName}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await this.emailService.send({
            to: order.customerEmail,
            subject: `Order #${order.orderNumber} - ${order.newStatus}`,
            html,
            tags: [
                { name: 'category', value: 'order_status' },
                { name: 'order_number', value: order.orderNumber },
                { name: 'status', value: order.newStatus },
            ],
        });
    }

    // ===========================================
    // EVENT LISTENERS
    // ===========================================

    @OnEvent('order.created')
    async handleOrderCreated(payload: { order: any; tenantId: string }) {
        this.logger.log(`Order created event: ${payload.order.orderNumber}`);

        await this.sendOrderConfirmation({
            tenantId: payload.tenantId,
            orderNumber: payload.order.orderNumber,
            customerEmail: payload.order.customerEmail,
            customerName: payload.order.customerName,
            items: payload.order.items || [],
            totalCents: payload.order.totalCents,
            currency: payload.order.currency || 'EUR',
        });
    }

    @OnEvent('order.status_changed')
    async handleOrderStatusChanged(payload: {
        order: any;
        previousStatus: string;
        newStatus: string;
        tenantId: string;
    }) {
        this.logger.log(`Order status changed: ${payload.order.orderNumber} -> ${payload.newStatus}`);

        // Only send email for meaningful status changes
        const notifyStatuses = ['PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
        if (!notifyStatuses.includes(payload.newStatus)) {
            return;
        }

        await this.sendStatusUpdate({
            tenantId: payload.tenantId,
            orderNumber: payload.order.orderNumber,
            customerEmail: payload.order.customerEmail,
            customerName: payload.order.customerName,
            previousStatus: payload.previousStatus,
            newStatus: payload.newStatus,
        });
    }

    // ===========================================
    // HELPERS
    // ===========================================

    private formatPrice(cents: number, currency: string): string {
        const amount = cents / 100;
        const symbols: Record<string, string> = {
            EUR: '€',
            USD: '$',
            GBP: '£',
        };
        const symbol = symbols[currency] || currency + ' ';
        return `${symbol}${amount.toFixed(2)}`;
    }
}
