# Sources — @planetscale/database

## Claim: execute() throws DatabaseError on HTTP failures

**Source:** GitHub source code — `src/index.ts`
https://github.com/planetscale/database-js/blob/main/src/index.ts

`DatabaseError` is defined with `status` (HTTP code) and `body` (VitessError) properties. The `execute()` method throws `DatabaseError` on non-ok HTTP responses.

**Source:** PlanetScale documentation
https://planetscale.com/docs/vitess/tutorials/planetscale-serverless-driver

Official documentation for the serverless driver.

## Claim: DatabaseError class hierarchy

```typescript
class DatabaseError extends Error {
  body: VitessError;   // { code: string, message: string }
  status: number;      // HTTP status code
}
```

**Source:** GitHub source code — exported from src/index.ts

## Claim: transaction() rolls back on unhandled errors

**Source:** PlanetScale documentation and SDK README
https://github.com/planetscale/database-js#transactions

"If any unhandled errors are thrown during execution of the transaction, it will be rolled back."

## Claim: Network errors throw TypeError

**Source:** GitHub issue #142
https://github.com/planetscale/database-js/issues/142

"TypeError: fetch failed" is thrown when the network connection fails.

## Package Metadata

- **Package:** `@planetscale/database`
- **npm:** https://www.npmjs.com/package/@planetscale/database
- **GitHub:** https://github.com/planetscale/database-js
- **Weekly downloads:** ~53k (2025)
- **Verified version range:** >=1.0.0
- **License:** Apache-2.0
- **Maintainer:** PlanetScale
