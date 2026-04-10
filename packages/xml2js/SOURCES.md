# Sources — xml2js

## Fetched Documentation

| URL | Fetched | Summary |
|-----|---------|---------|
| https://raw.githubusercontent.com/Leonidas-from-XIV/node-xml2js/master/README.md | 2026-04-02 | Official README — Promise usage section shows .catch() handler required for parseStringPromise |
| https://github.com/Leonidas-from-XIV/node-xml2js/blob/master/lib/parser.js | 2026-04-02 | Parser source — parseStringPromise wraps callback, rejects with error param |
| https://github.com/advisories/GHSA-776f-qx25-q3cc | 2026-04-02 | CVE-2023-0842 — Prototype pollution in <0.5.0, fixed in 0.5.0+ (current: 0.6.2) |

## Type Definitions

- @types/xml2js@0.4.14 — `parseStringPromise` returns `Promise<any>`, `ValidationError extends Error`
- Package extracted via npm pack to `/private/tmp/claude-501/xml2js-inspect/`

## Real-world Evidence

- `civitai/civitai` — `src/server/http/ncmec/ncmec.caller.ts`: 3 unprotected `await parseStringPromise()` calls in NCMEC compliance integration
- `sct/overseerr`, `seerr-team/seerr` — `server/api/plextv.ts`: mixed protected/unprotected calls; `getUsers()` method at line 263 unprotected
