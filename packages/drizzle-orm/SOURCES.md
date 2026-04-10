# Sources: drizzle-orm

**Package:** `drizzle-orm`
**Version:** 0.45.1
**Category:** database (TypeScript ORM)

## Official Documentation
- https://orm.drizzle.team/
- https://orm.drizzle.team/docs/select
- https://orm.drizzle.team/docs/insert
- https://github.com/drizzle-team/drizzle-orm

## Behavioral Requirements
**Database errors:** Constraint violations, connection failures, SQL syntax errors
**Must wrap all CRUD operations in try-catch**

## Contract Rationale
**TypeScript-first ORM** - Type-safe queries still need runtime error handling
**Production-critical** - Data integrity, constraint enforcement

**Created:** 2026-02-25
**Status:** ✅ COMPLETE
