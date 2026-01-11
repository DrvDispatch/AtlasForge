/**
 * Seed Script: Atlas Accessories Store
 * 
 * Creates a demo tenant with smartphone accessories offerings
 * for testing the ecommerce flow.
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Atlas Accessories Store...\n');

    // ============================================
    // 1. Create Tenant
    // ============================================
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'atlas-accessories' },
        update: {},
        create: {
            name: 'Atlas Accessories Store',
            slug: 'atlas-accessories',
            status: 'ACTIVE',
        },
    });
    console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

    // ============================================
    // 2. Create Tenant Config
    // ============================================
    await prisma.tenantConfig.upsert({
        where: { tenantId: tenant.id },
        update: {},
        create: {
            tenantId: tenant.id,
            businessName: 'Atlas Accessories Store',
            email: 'info@atlas-accessories.com',
            phone: '+32 123 456 789',
            primaryColor: '#2563eb',
            locale: 'en',
            currency: 'EUR',
            currencySymbol: '€',
            timezone: 'Europe/Brussels',
        },
    });
    console.log('✅ Tenant config created');

    // ============================================
    // 3. Create Tenant Features
    // ============================================
    await prisma.tenantFeature.upsert({
        where: { tenantId: tenant.id },
        update: {
            ecommerceEnabled: true,
            catalogEnabled: true,
            bookingsEnabled: false,
        },
        create: {
            tenantId: tenant.id,
            ecommerceEnabled: true,
            catalogEnabled: true,
            bookingsEnabled: false,
        },
    });
    console.log('✅ Tenant features (ecommerce enabled)');

    // ============================================
    // 4. Create Admin User
    // ============================================
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'admin@atlas-accessories.com' } },
        update: {},
        create: {
            tenantId: tenant.id,
            email: 'admin@atlas-accessories.com',
            passwordHash,
            name: 'Store Admin',
            role: 'ADMIN',
            emailVerified: new Date(),
        },
    });
    console.log(`✅ Admin user: ${adminUser.email}`);

    // ============================================
    // 5. Create Category
    // ============================================
    const category = await prisma.offeringCategory.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug: 'smartphone-accessories' } },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Smartphone Accessories',
            slug: 'smartphone-accessories',
            description: 'Essential accessories for your smartphone',
            isActive: true,
            depth: 0,
        },
    });
    console.log(`✅ Category: ${category.name}`);

    // Image URL base from MinIO
    const S3_BASE = process.env.S3_ENDPOINT || 'http://localhost:9002';
    const S3_BUCKET = process.env.S3_BUCKET || 'atlasforge';
    const imageUrl = (slug: string) => `${S3_BASE}/${S3_BUCKET}/products/${slug}.png`;

    const offerings = [
        {
            name: 'Universal Phone Holder',
            slug: 'universal-phone-holder',
            description: 'Adjustable phone holder compatible with all smartphones. Perfect for desk use.',
            priceCents: 1999,
            priceDisplay: '€19.99',
            image: imageUrl('universal-phone-holder'),
            isFeatured: true,
        },
        {
            name: 'Car Mount Pro',
            slug: 'car-mount-pro',
            description: 'Premium magnetic car mount with 360° rotation. Fits all air vents.',
            priceCents: 2499,
            priceDisplay: '€24.99',
            image: imageUrl('car-mount-pro'),
            isFeatured: true,
        },
        {
            name: 'USB-C Fast Charging Cable',
            slug: 'usb-c-fast-charging-cable',
            description: '1.8m braided USB-C cable supporting up to 100W fast charging.',
            priceCents: 1299,
            priceDisplay: '€12.99',
            image: imageUrl('usb-c-fast-charging-cable'),
            isFeatured: false,
        },
        {
            name: 'Wireless Charger Pad',
            slug: 'wireless-charger-pad',
            description: '15W wireless charging pad with LED indicator. Qi compatible.',
            priceCents: 2999,
            priceDisplay: '€29.99',
            image: imageUrl('wireless-charger-pad'),
            isFeatured: true,
        },
        {
            name: 'Phone Stand Aluminum',
            slug: 'phone-stand-aluminum',
            description: 'Premium aluminum phone stand. Adjustable angle for video calls.',
            priceCents: 3499,
            priceDisplay: '€34.99',
            image: imageUrl('phone-stand-aluminum'),
            isFeatured: false,
        },
        {
            name: 'Screen Protector Pack (3x)',
            slug: 'screen-protector-pack',
            description: 'Tempered glass screen protector. Bubble-free installation included.',
            priceCents: 999,
            priceDisplay: '€9.99',
            image: imageUrl('screen-protector-pack'),
            isFeatured: false,
        },
        {
            name: 'Power Bank 10000mAh',
            slug: 'power-bank-10000',
            description: 'Compact power bank with dual USB-A and USB-C output. LED display.',
            priceCents: 3999,
            priceDisplay: '€39.99',
            image: imageUrl('power-bank-10000'),
            isFeatured: true,
        },
        {
            name: 'Bluetooth Earbuds',
            slug: 'bluetooth-earbuds',
            description: 'True wireless earbuds with noise cancellation. 24h battery with case.',
            priceCents: 4999,
            priceDisplay: '€49.99',
            image: imageUrl('bluetooth-earbuds'),
            isFeatured: true,
        },
    ];

    for (let i = 0; i < offerings.length; i++) {
        const offering = offerings[i];
        await prisma.offering.upsert({
            where: { tenantId_slug: { tenantId: tenant.id, slug: offering.slug } },
            update: {},
            create: {
                tenantId: tenant.id,
                categoryId: category.id,
                name: offering.name,
                slug: offering.slug,
                description: offering.description,
                priceCents: offering.priceCents,
                priceDisplay: offering.priceDisplay,
                image: offering.image,
                isFeatured: offering.isFeatured,
                isActive: true,
                sortOrder: i,
            },
        });
        console.log(`   📦 ${offering.name} - ${offering.priceDisplay}`);
    }

    console.log(`\n✅ Created ${offerings.length} offerings`);

    // ============================================
    // Summary
    // ============================================
    console.log('\n================================================');
    console.log('🎉 Atlas Accessories Store seeded successfully!');
    console.log('================================================');
    console.log(`\nTenant ID: ${tenant.id}`);
    console.log(`Admin login: admin@atlas-accessories.com / admin123`);
    console.log(`\nTest in Swagger: http://localhost:3001/docs`);
    console.log('\nTo test the flow:');
    console.log('1. GET /api/offerings - List products');
    console.log('2. POST /api/cart/items - Add to cart');
    console.log('3. POST /api/checkout - Create order');
    console.log('4. GET /api/admin/orders - View orders (requires auth)');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
