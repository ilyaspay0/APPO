#!/usr/bin/env node
/**
 * DEPRECATED — meta JSON files are no longer the source of truth.
 *
 * Catalog metadata is served live from Supabase content_exams
 * (via /api/*-exams or directly from the client).
 *
 * Kept as a no-op stub so old CI/npm scripts do not break.
 * To refresh a static snapshot for offline tooling, use:
 *   node scripts/generate-sitemap.js
 */
"use strict";

console.log(
  "build-meta.js: no-op. Metadata now comes from Supabase content_exams."
);
console.log(
  "Run: node scripts/migrate-json-to-supabase.js  (if seeding from legacy JSON)"
);
process.exit(0);
