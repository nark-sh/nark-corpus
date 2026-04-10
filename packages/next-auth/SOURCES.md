# Sources: next-auth

## Official Documentation

- **Main docs:** https://next-auth.js.org/getting-started/introduction
- **JWT options:** https://next-auth.js.org/configuration/options#jwt
- **Secret config:** https://next-auth.js.org/configuration/options#secret
- **getToken:** https://next-auth.js.org/tutorials/securing-pages-and-api-routes#using-gettoken
- **Callbacks reference:** https://next-auth.js.org/configuration/callbacks
- **Error codes:** https://next-auth.js.org/errors
- **v4 upgrade guide:** https://next-auth.js.org/getting-started/upgrade-v4

## Source Code Evidence

- **JWT implementation:** `next-auth/jwt/index.js` — confirms encode/decode can throw, getToken catches errors internally
- **hkdf dependency:** `@panva/hkdf` — throws TypeError when ikm (secret) is undefined/null/empty
- **jose dependency:** `jose` library's `jwtDecrypt` throws `JWEDecryptionFailed`, `JWTExpired`, `JWTInvalid`

## Security Advisories

- **CVE-2022-29214** — Open redirect via callbackUrl (fixed in 4.3.3)
  https://github.com/nextauthjs/next-auth/security/advisories/GHSA-pg5p-wwp8-97g8
- **CVE-2023-48309** — Authorization bypass via id_token (fixed in 4.24.5)
  https://github.com/nextauthjs/next-auth/security/advisories/GHSA-7r7x-4c4q-c4qf

## Real-World Usage Evidence

| Repo | Version | Pattern |
|------|---------|---------|
| dub.co | 4.24.11 | getToken() in middleware, signIn() with response check |
| cal.com | 4.24.13 | encode() in jwt callback, getToken() in API routes |
| taxonomy | 4.22.1 | getToken() in middleware |
| formbricks | 4.24.12 | getToken() in proxy |
