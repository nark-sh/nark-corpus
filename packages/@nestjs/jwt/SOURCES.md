# @nestjs/jwt Contract Sources

## Package Overview

`@nestjs/jwt` is a NestJS module wrapping the `jsonwebtoken` library for JWT token signing and verification.
It provides `JwtService` with async and sync variants of `sign()` and `verify()`.

## Key Error Types

From `jsonwebtoken` (the underlying library):

- **`JsonWebTokenError`** — invalid signature, malformed token, audience/issuer/subject mismatch
- **`TokenExpiredError`** — token's `exp` claim is in the past
- **`NotBeforeError`** — token's `nbf` claim is in the future

`@nestjs/jwt` also adds:
- **`WrongSecretProviderError`** — when `verify()` (sync) encounters an async `secretOrKeyProvider`

## Detection

`detection.type_names: [JwtService]` — tracks class instances created via constructor injection.
The scanner detects `this.jwtService.verifyAsync()`, `this.jwtService.verify()`, etc.

## Evidence

- Official NestJS sample: `nestjs/sample/19-auth-jwt` — `signAsync()` without try-catch (TP)
- Hoppscotch backend: 9 checks, 0 violations — correct usage of try-catch
- Real-world precision: 100% (1 TP, 0 FP across 2 repos)

## Sources

- https://github.com/nestjs/jwt/blob/master/README.md
- https://github.com/auth0/node-jsonwebtoken#errors--codes
- https://docs.nestjs.com/security/authentication
