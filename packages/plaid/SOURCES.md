# Sources — plaid

## Official Documentation

| URL | Description | Used For |
|-----|-------------|---------|
| https://plaid.com/docs/api/ | Plaid API reference | Overall API surface |
| https://plaid.com/docs/errors/ | Error types overview | Postcondition: api-error |
| https://plaid.com/docs/errors/item/ | ITEM_ERROR codes (30+ codes) | transactionsSync, accountsGet, authGet |
| https://plaid.com/docs/errors/invalid-input/ | INVALID_INPUT codes | itemPublicTokenExchange |
| https://plaid.com/docs/errors/api/ | API_ERROR (internal Plaid) | All functions |
| https://plaid.com/docs/api/tokens/#linktokencreate | linkTokenCreate endpoint | linkTokenCreate function |
| https://plaid.com/docs/api/tokens/#itempublictokenexchange | itemPublicTokenExchange endpoint | itemPublicTokenExchange function |
| https://plaid.com/docs/api/products/transactions/#transactionssync | transactionsSync endpoint | transactionsSync function |
| https://plaid.com/docs/api/accounts/#accountsget | accountsGet endpoint | accountsGet function |
| https://plaid.com/docs/api/products/auth/#authget | authGet endpoint | authGet function |
| https://plaid.com/docs/api/products/transfer/#transfercreate | transferCreate endpoint | transferCreate function |

## SDK Source

| URL | Description |
|-----|-------------|
| https://github.com/plaid/plaid-node | Official plaid-node GitHub repo |
| https://github.com/plaid/plaid-node/blob/master/CHANGELOG.md | SDK version history |
| https://www.npmjs.com/package/plaid | npm package page (v41.4.0 latest) |

## Key Evidence

From https://plaid.com/docs/errors/:
> "Each error response includes an error_type and error_code. Use these fields for
> programmatic error handling, not the HTTP status code."

> "We recommend against logging the full error object in production, as it may include
> sensitive information such as your Plaid API keys in the request configuration."

From SDK source — all PlaidApi methods are generated from OpenAPI spec using
`typescript-axios` generator. They return `Promise<AxiosResponse<T>>` and throw
Axios errors on non-2xx responses. The PlaidError payload is in `error.response.data`.

## SDK Version Notes

- **v9-v13:** First OpenAPI-generated rewrite; `PlaidApi` class introduced
- **v14+:** Stable `Configuration` + `PlaidApi` pattern (targeted semver)
- **v19:** Removed index signatures for stricter TypeScript
- **v41.4.0:** Current latest (as of 2026-03-12)
