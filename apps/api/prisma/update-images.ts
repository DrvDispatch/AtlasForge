import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const S3_BASE = process.env.S3_ENDPOINT || 'http://localhost:9002';
const S3_BUCKET = process.env.S3_BUCKET || 'atlasforge';

const imageUrl = (slug: string) => `${S3_BASE}/${S3_BUCKET}/products/${slug}.png`;

const imageMap: Record<string, string> = {
    'universal-phone-holder': imageUrl('universal-phone-holder'),
    'car-mount-pro': imageUrl('car-mount-pro'),
    'usb-c-fast-charging-cable': imageUrl('usb-c-fast-charging-cable'),
    'wireless-charger-pad': imageUrl('wireless-charger-pad'),
    'phone-stand-aluminum': imageUrl('phone-stand-aluminum'),
    'screen-protector-pack': imageUrl('screen-protector-pack'),
    'power-bank-10000': imageUrl('power-bank-10000'),
    'bluetooth-earbuds': imageUrl('bluetooth-earbuds'),
};

async function main() {
    console.log('🖼️  Updating product images in database...\n');

    for (const [slug, url] of Object.entries(imageMap)) {
        const result = await prisma.offering.updateMany({
            where: { slug },
            data: { image: url },
        });
        console.log(`   ✅ ${slug} → ${result.count} updated`);
    }

    console.log('\n✅ All product images updated!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
