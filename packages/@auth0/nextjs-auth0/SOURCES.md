# Sources — @auth0/nextjs-auth0

## Official Documentation

### Primary API Reference
- **getAccessToken**: https://auth0.github.io/nextjs-auth0/functions/server.getAccessToken.html
  - Documents all `AccessTokenError` error codes and when they're thrown
  - Confirms throws: `MISSING_SESSION`, `MISSING_ACCESS_TOKEN`, `MISSING_REFRESH_TOKEN`, `EXPIRED_ACCESS_TOKEN`, `INSUFFICIENT_SCOPE`, `FAILED_REFRESH_GRANT`

- **handleCallback**: https://auth0.github.io/nextjs-auth0/functions/server.handleCallback.html
  - Documents `CallbackHandlerError` thrown on OAuth callback failures

- **handleLogin**: https://auth0.github.io/nextjs-auth0/functions/server.handleLogin.html
  - Documents `LoginHandlerError` thrown on login redirect failures

- **handleLogout**: https://auth0.github.io/nextjs-auth0/functions/server.handleLogout.html
  - Documents `LogoutHandlerError` thrown on logout failures

### Examples & Error Handling
- **Official EXAMPLES.md**: https://github.com/auth0/nextjs-auth0/blob/main/EXAMPLES.md
  - Contains both antipatterns (no try-catch) and correct patterns with error handling

- **Error Handling Section**: https://github.com/auth0/nextjs-auth0#error-handling
  - Documents `onError` handler and try-catch patterns

### Quickstart
- **Auth0 Next.js Quickstart**: https://auth0.com/docs/quickstart/webapp/nextjs
  - Official getting started guide; some code examples lack error handling (real-world antipattern source)

## Version Information

- Package: `@auth0/nextjs-auth0`
- Contract semver range: `>=2.0.0 <4.0.0`
- v2.x and v3.x share the same standalone function API
- v4.x (Auth0Client instance pattern) requires a separate contract

## Error Types

### AccessTokenError (getAccessToken)
```typescript
import { AccessTokenError, AccessTokenErrorCode } from '@auth0/nextjs-auth0';

// Error codes:
AccessTokenErrorCode.MISSING_SESSION          // 'ERR_EXPIRED_ACCESS_TOKEN'
AccessTokenErrorCode.MISSING_ACCESS_TOKEN     // 'ERR_MISSING_ACCESS_TOKEN'
AccessTokenErrorCode.MISSING_REFRESH_TOKEN    // 'ERR_MISSING_REFRESH_TOKEN'
AccessTokenErrorCode.EXPIRED_ACCESS_TOKEN     // 'ERR_EXPIRED_ACCESS_TOKEN'
AccessTokenErrorCode.INSUFFICIENT_SCOPE       // 'ERR_INSUFFICIENT_SCOPE'
AccessTokenErrorCode.FAILED_REFRESH_GRANT     // 'ERR_FAILED_REFRESH_GRANT'
```

### Handler Errors
```typescript
import { HandlerError, CallbackHandlerError, LoginHandlerError, LogoutHandlerError } from '@auth0/nextjs-auth0';
```

## Real-World Evidence

- Local: `test-repos/nextjs/examples/auth0/pages/api/protected-api.ts`
  — `getSession` called without try-catch (official example missing error handling)
- npm downloads: ~3.8M weekly (major auth provider for Next.js SaaS)
- Evidence quality: partial (local example confirmed; broader corpus TBD)
