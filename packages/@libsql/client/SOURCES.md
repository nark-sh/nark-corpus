# Sources — @libsql/client

## Claim: execute() throws LibsqlError

**Source:** GitHub repository — tursodatabase/libsql-client-ts
https://github.com/tursodatabase/libsql-client-ts

LibsqlError is the error class thrown on all failures. Properties: code (string), rawCode (optional number).

**Source:** GitHub issues showing LibsqlError in practice:
https://github.com/tursodatabase/libsql-client-ts/issues/202
"LibsqlError: SERVER_ERROR: Server returned HTTP status 400"

## Claim: Official examples omit try-catch

**Source:** Official Next.js with-turso example
https://github.com/vercel/next.js/tree/canary/examples/with-turso

Both `addTodo` and `removeTodo` server actions call `db.execute()` without try-catch.

## Claim: Error codes

**Source:** GitHub issues and community discussions
- SERVER_ERROR: HTTP errors from Turso API
- AUTH_FAILED: Invalid auth token
- URL_INVALID: Bad database URL
- SQLITE_ERROR: SQLite constraint/syntax errors

## Package Metadata

- **Package:** `@libsql/client`
- **npm:** https://www.npmjs.com/package/@libsql/client
- **GitHub:** https://github.com/tursodatabase/libsql-client-ts
- **Verified version range:** >=0.3.0
- **License:** MIT
- **Maintainer:** Turso (tursodatabase)
