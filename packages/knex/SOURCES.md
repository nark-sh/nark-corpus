# Sources: knex

**Package:** `knex`
**Version:** 3.x
**Category:** database (SQL query builder)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://knexjs.org/
- **Query Builder:** https://knexjs.org/guide/query-builder.html
- **Transactions:** https://knexjs.org/guide/transactions.html
- **Schema:** https://knexjs.org/guide/schema-builder.html
- **Destroy:** https://knexjs.org/guide/#destroy
- **npm:** https://www.npmjs.com/package/knex

## Behavioral Requirements

**SQL Errors:** Syntax errors, constraint violations, type mismatches
**Connection Errors:** Database down, auth failures
**Must wrap queries in try-catch** to handle SQL errors
**Transactions must handle rollback** on errors
**Must call destroy()** on shutdown to close connections

## Contract Rationale

**SQL queries can fail:** Syntax, constraints, connections
**Transaction errors leave database inconsistent:** Must rollback
**Unclosed connections prevent graceful shutdown**

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
