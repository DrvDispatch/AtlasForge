/**
 * Seed Images Script
 * 
 * Uploads product images to MinIO and updates the seed with proper URLs.
 * Run this before prisma db seed.
 */

import 'dotenv/config';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const MINIO_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9002';
const MINIO_BUCKET = process.env.S3_BUCKET || 'atlasforge';
const MINIO_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin';

const s3Client = new S3Client({
    endpoint: MINIO_ENDPOINT,
    region: 'us-east-1',
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // Required for MinIO
});

// Map of product slugs to their image files
const IMAGES_DIR = 'C:/Users/saidm/.gemini/antigravity/brain/a7f4fd6e-f867-46a9-9e2c-6f80a7c3eeb5';

const productImages: Record<string, string> = {
    'universal-phone-holder': 'phone_holder_1767996485911.png',
    'car-mount-pro': 'car_mount_1767996498137.png',
    'usb-c-fast-charging-cable': 'usb_c_cable_1767996559082.png',
    'wireless-charger-pad': 'wireless_charger_1767996523574.png',
    'phone-stand-aluminum': 'phone_stand_1767996571956.png',
    'screen-protector-pack': 'screen_protector_1767996585661.png',
    'power-bank-10000': 'power_bank_1767996535741.png',
    'bluetooth-earbuds': 'bluetooth_earbuds_1767996598731.png',
};

async function ensureBucket(): Promise<void> {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
        console.log(`✅ Bucket '${MINIO_BUCKET}' already exists`);
    } catch {
        console.log(`📦 Creating bucket '${MINIO_BUCKET}'...`);
        await s3Client.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
        console.log(`✅ Bucket '${MINIO_BUCKET}' created`);
    }
}

async function uploadImage(slug: string, filename: string): Promise<string> {
    const filePath = path.join(IMAGES_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Image not found: ${filename}`);
        return '';
    }

    const fileContent = fs.readFileSync(filePath);
    const key = `products/${slug}.png`;

    await s3Client.send(new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: 'image/png',
    }));

    const url = `${MINIO_ENDPOINT}/${MINIO_BUCKET}/${key}`;
    console.log(`   📷 ${slug} → ${url}`);
    return url;
}

async function main(): Promise<void> {
    console.log('🖼️  Seeding product images to MinIO...\n');
    console.log(`   Endpoint: ${MINIO_ENDPOINT}`);
    console.log(`   Bucket: ${MINIO_BUCKET}\n`);

    await ensureBucket();
    console.log('\n📤 Uploading images...\n');

    const urlMap: Record<string, string> = {};

    for (const [slug, filename] of Object.entries(productImages)) {
        const url = await uploadImage(slug, filename);
        if (url) {
            urlMap[slug] = url;
        }
    }

    console.log('\n✅ All images uploaded!');
    console.log('\n📋 URL Map (for seed.ts):\n');
    console.log(JSON.stringify(urlMap, null, 2));

    // Write the URL map to a JSON file for the seed to use
    fs.writeFileSync(
        path.join(__dirname, 'product-images.json'),
        JSON.stringify(urlMap, null, 2)
    );
    console.log('\n✅ Saved to prisma/product-images.json');
}

main().catch(console.error);
