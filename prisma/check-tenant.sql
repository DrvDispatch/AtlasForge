-- Check tenant
SELECT id, name, slug FROM "Tenant" LIMIT 1;

-- Check existing domains
SELECT * FROM "TenantDomain";
