# Sources — jwt-decode

| URL | Fetched | Summary |
|-----|---------|---------|
| https://github.com/auth0/jwt-decode | 2026-04-02 | Official README and API docs |
| https://github.com/auth0/jwt-decode/blob/main/lib/index.ts | 2026-04-02 | Full source examined via GitHub API |

## Key Findings

- `jwtDecode()` throws `InvalidTokenError` (extends Error) on malformed tokens
- Error messages: "must be a string", "missing part #N", "invalid base64 for part #N", "invalid json for part #N"
- `InvalidTokenError` is exported from the package
- Library is synchronous — does NOT make network calls
- Does NOT validate JWT signatures — only decodes
- 0 GitHub security advisories as of 2026-04-02
