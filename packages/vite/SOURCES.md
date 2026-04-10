# SOURCES: vite

Documentation sources for behavioral claims in `contract.yaml`.

---

## Primary Sources

### Official JavaScript API Reference
**URL:** https://vite.dev/guide/api-javascript
**Content:** Definitive reference for `build()`, `createServer()`, and `preview()` function signatures, return types, and usage examples.
**Claims supported:**
- build() is async and returns Promise<RolldownOutput | ...>
- createServer() returns Promise<ViteDevServer> with .listen() and .close()
- preview() does not check for build output when called programmatically

### Build Guide
**URL:** https://vite.dev/guide/build
**Content:** Production build configuration and options.
**Claims supported:**
- build.watch mode changes return type to RolldownWatcher
- SSR builds have restrictions on input format

---

## Security Sources (CVEs)

### CVE-2025-24010 — CORS / WebSocket origin (Moderate 6.5)
**GHSA:** https://github.com/advisories/GHSA-vg6x-rcgg-rjx6
**Affected:** v4.x <4.5.6, v5.x <5.4.12, v6.x <6.0.9
**Summary:** Permissive CORS and missing WebSocket origin check allowed CSRF via DNS rebinding even on localhost.

### CVE-2025-31125 — server.fs.deny bypass (Moderate 5.3)
**GHSA:** https://github.com/advisories/GHSA-4r4m-qw57-chr8
**Affected:** v5.x <5.4.16, v6.x <6.2.4
**Summary:** `?inline&import` query string bypassed server.fs.deny allowlist.

### CVE-2025-30208 — @fs bypass (Moderate 5.3)
**GHSA:** https://github.com/advisories/GHSA-x574-m823-4x7w
**Affected:** v5.x <5.4.15, v6.x <6.2.3
**Summary:** `@fs` virtual module bypass using `?raw??` trailing separator.

### CVE-2025-62522 — Windows path bypass (Moderate 6.0)
**GHSA:** https://github.com/advisories/GHSA-93m4-6634-74q7
**Affected:** v5.x <5.4.21, v6.x <6.4.1, v7.x <7.1.11
**Summary:** Trailing `\` in Windows paths bypassed server.fs.deny.

### CVE-2024-45812 — DOM Clobbering in bundled output (Moderate 4.8)
**GHSA:** https://github.com/advisories/GHSA-64vr-g452-qvp3
**Affected:** v3.x <3.2.11, v4.x <4.5.4, v5.x <5.4.6
**Summary:** cjs/iife/umd output used document.currentScript in a DOM-clobbering-susceptible way, enabling XSS.

---

## Notes

- All CVEs affect the dev server or build output, not the programmatic API's error handling contract.
- The behavioral contracts focus on async error handling obligations, not security version constraints.
- vite error messages are enhanced by `enhanceRollupError()` before being re-thrown — the RollupError shape applies.
