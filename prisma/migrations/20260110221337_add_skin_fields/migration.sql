-- AlterTable
ALTER TABLE "TenantConfig" ADD COLUMN     "allowedOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "frontendUrl" TEXT,
ADD COLUMN     "skinName" TEXT NOT NULL DEFAULT 'minimal';
