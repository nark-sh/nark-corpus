# Sources: @vercel/postgres

**Package:** `@vercel/postgres`
**Version:** 0.10.0
**Category:** database (Serverless Postgres client)
**Status:** ⚠️ Deprecated - Migrated to Neon

---

## Official Documentation

- **Main Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Error Codes:** https://vercel.com/docs/storage/vercel-postgres/vercel-postgres-error-codes
- **Connection Pooling:** https://vercel.com/kb/guide/connection-pooling-with-functions
- **npm:** https://www.npmjs.com/package/@vercel/postgres
- **Repository:** https://github.com/vercel/storage

## Behavioral Requirements

**SQL Query Errors:** Syntax errors, constraint violations, type mismatches
**Connection Errors:** Pool exhaustion, missing connection string
**Must wrap sql/query in try-catch for error handling**
**Must release pooled connections in finally blocks**

## Contract Rationale

**Critical for serverless:** Limited connection pools (5-20), high concurrency, stateless functions
**SQL errors crash functions** → 500 responses  
**Connection leaks exhaust pool** → application hangs

**Created:** 2026-02-25
**Status:** ✅ COMPLETE
