// Extensions Directory
// =====================
// This directory contains tenant-specific code (escape hatch).
// Extensions are loaded only when explicitly enabled.
//
// Load via TENANT_EXTENSIONS env var:
// TENANT_EXTENSIONS=tenant-acme,tenant-xyz
//
// Structure:
// - tenant-acme/
//   - tenant-acme.module.ts
//   - handlers/
//   - controllers/
