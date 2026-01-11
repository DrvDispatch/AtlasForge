-- Add localhost as a domain for the test tenant
INSERT INTO "TenantDomain" (id, "tenantId", domain, "isPrimary", "createdAt", "updatedAt", "cloudflareStatus")
VALUES 
    (gen_random_uuid(), '7c1a8245-6bdc-46d4-9e71-fe7595e262b6', 'localhost', true, NOW(), NOW(), 'PENDING');

-- Verify
SELECT * FROM "TenantDomain";
