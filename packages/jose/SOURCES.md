# Sources — jose

**Research Date:** 2026-04-02

## Official Sources

| URL | Fetched | Summary |
|-----|---------|---------|
| https://github.com/panva/jose | 2026-04-02 | Official repository homepage |
| https://raw.githubusercontent.com/panva/jose/main/README.md | 2026-04-02 | Main README with API overview |
| /tmp/jose-check/package/dist/types/util/errors.d.ts | 2026-04-02 | Full error class hierarchy (from npm pack jose@6.2.2) |
| /tmp/jose-check/package/dist/types/jwt/verify.d.ts | 2026-04-02 | jwtVerify function signature |
| /tmp/jose-check/package/dist/webapi/lib/jwt_claims_set.js | 2026-04-02 | Source confirms JWTExpired and JWTClaimValidationFailed throws |
| /tmp/jose-check/package/dist/webapi/jws/flattened/verify.js | 2026-04-02 | Source confirms JWSSignatureVerificationFailed throw |

## Key Error Types Confirmed

- `JWTExpired` — thrown when `exp` claim check fails (token expired)
- `JWTClaimValidationFailed` — thrown when iss/aud/sub/nbf claims fail
- `JWSSignatureVerificationFailed` — thrown when signature doesn't match key
- `JWSInvalid` — thrown on malformed JWS structure
- `JWTInvalid` — thrown on malformed JWT
- `JWKInvalid` — thrown on invalid key in importJWK
- `JWKSNoMatchingKey` — thrown when no key in JWKS matches
- `JWKSTimeout` — thrown when remote JWKS fetch times out

## Real-World Evidence

| Repo | Stars | Evidence |
|------|-------|----------|
| nextjs/saas-starter | 15,534★ | TP: jwtVerify without try-catch in session.ts |
| daytonaio/daytona | 69,919★ | TP: jwtVerify without try-catch in jwt.strategy.ts |
| Portkey-AI/gateway | 10,998★ | Correctly handled — try-catch present |
| civitai/civitai | 7,044★ | Correctly handled — try-catch around sign |
