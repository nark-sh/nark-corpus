# Sources — google-auth-library

## Documentation Sources (fetched 2026-04-02)

| URL | Summary |
|-----|---------|
| https://raw.githubusercontent.com/googleapis/google-auth-library-nodejs/main/README.md | Main README — getTokenInfo documented to throw if token invalid; GaxiosError referenced |
| https://googleapis.dev/nodejs/google-auth-library/latest/classes/GoogleAuth.html | API reference — getIdTokenClient throws if not in GCE/service account env; getClient ADC loading |

## Package Source Inspection

- Inspected `/private/tmp/claude-501/pkg-inspect/package/build/src/auth/googleauth.js` — GoogleAuthExceptionMessages constants
- Inspected `/private/tmp/claude-501/pkg-inspect/package/build/src/auth/oauth2client.js` — throw patterns for getToken, refreshAccessToken
- Inspected `/private/tmp/claude-501/pkg-inspect/package/build/src/auth/authclient.d.ts` — getAccessToken, request method signatures

## Real-World Usage Evidence

| Repo | File | Pattern |
|------|------|---------|
| gitroomhq/postiz-app (27k⭐) | `libraries/.../youtube.provider.ts:183` | `client.getToken(params.code)` without try-catch |
| civitai/civitai (7k⭐) | `src/server/youtube/client.ts:45` | `client.getToken({code, redirect_uri})` without try-catch |
| google/clasp (5.5k⭐) | `src/auth/auth_code_flow.ts:53` | `oauth2Client.getToken({code, redirect_uri})` without try-catch |
