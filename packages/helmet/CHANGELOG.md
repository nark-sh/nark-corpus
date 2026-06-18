# CHANGELOG — helmet

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — deepen pass — coverage 89% → 100%

- **Profile:** `packages/helmet/contract.yaml`
- **Functions added:** none (all 9 error-throwing factories already contracted)
- **Postconditions added:** 6
  - `helmet`: `helmet-passed-as-middleware-not-factory` (the canonical `app.use(helmet)` bug — factory throws on first request when invoked with an IncomingMessage)
  - `helmet`: `helmet-duplicate-option-pair` (collapses 8 modern-vs-legacy alias conflict cases: strictTransportSecurity/hsts, xContentTypeOptions/noSniff, xDnsPrefetchControl/dnsPrefetchControl, xDownloadOptions/ieNoOpen, xFrameOptions/frameguard, xPermittedCrossDomainPolicies/permittedCrossDomainPolicies, xPoweredBy/hidePoweredBy, xXssProtection/xssFilter)
  - `contentSecurityPolicy`: `csp-invalid-directive-value-chars` (helmet 8.x rejects `;`/`,` in directive values — both factory-time and request-time for function-typed values)
  - `contentSecurityPolicy`: `csp-unquoted-special-keyword` (catches the most common CSP misconfig — unquoted `none`, `self`, `unsafe-inline`, etc., and unquoted `nonce-`/`sha256-`/`sha384-`/`sha512-` prefixes)
  - `contentSecurityPolicy`: `csp-dangerously-disable-on-non-default-src` (rejects `dangerouslyDisableDefaultSrc` symbol used outside `defaultSrc`)
  - `contentSecurityPolicy`: `csp-falsy-directive-value` (catches env-var-without-fallback patterns where value resolves to undefined/empty)
- **Existing postcondition updated:** `coop-invalid-policy` — added `noopener-allow-popups` to allowed values list (helmet 8.x addition)
- **Functions intentionally omitted this pass:** none additional (six no-arg / option-less header middleware already documented as omitted: originAgentCluster, xContentTypeOptions, xDnsPrefetchControl, xDownloadOptions, xPoweredBy, xXssProtection — none throw on any input, verified against helmet@8.2.0 dist source)
- **Scanner concerns queued:** 6 (`concern-20260618-helmet-deepen-1` through `concern-20260618-helmet-deepen-6`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://helmetjs.github.io/
  - https://github.com/helmetjs/helmet/blob/main/index.ts
  - https://github.com/helmetjs/helmet/blob/main/middlewares/content-security-policy/index.ts
  - node_modules/helmet/index.cjs (helmet@8.2.0 dist — direct source inspection of the runtime validation paths)
- **Verified by:** bc-deepen-contract (pass 12 on 2026-06-18T23:30:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** helmet@8.2.0
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** helmet@8.2.0
- **Profile semver:** >=7.0.0 <9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** helmet@8.2.0
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** helmet@8.2.0
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** helmet@8.2.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** helmet@>=7.0.0 <9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
