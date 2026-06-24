# CHANGELOG — jose

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (+1 function)

- **Profile:** `packages/jose/contract.yaml`
- **Functions added:** createRemoteJWKSet.reload (1 total)
- **Postconditions added:** 1 (remote-jwks-reload-no-try-catch)
- **Drift discovery:** previously omitted from Phase 1 enumeration. jose@6.2.3 exposes `createRemoteJWKSet().reload()` as a user-callable async method that performs HTTP I/O. Distinct from the `createRemoteJWKSet`-as-key-resolver path already covered by `jwtVerify` (JWKSTimeout, JWKSNoMatchingKey) — `.reload()` is called *directly* by app code in OIDC key-rotation flows and surfaces JWKSTimeout / JOSEError / network errors at its own call site.
- **Functions intentionally omitted this pass:** unchanged from 2026-04-16 (flattenedVerify/generalVerify/flattenedDecrypt/generalDecrypt are niche serialization formats with identical error contracts; CompactEncrypt/FlattenedEncrypt/GeneralEncrypt/CompactSign/FlattenedSign/GeneralSign are lower-level builders rarely used directly; exportSPKI/exportPKCS8/exportJWK only fail on non-extractable keys (dev-time); generateSecret/calculateJwkThumbprint/calculateJwkThumbprintUri have no meaningful production error contracts)
- **Real-world usage confirmed:** corpus-builder/active/useautumn__autumn (Vercel OIDC integration) + superset-sh__superset (Electric Proxy auth)
- **Scanner concerns queued:** 0 — scanner already detects `.reload()` on createRemoteJWKSet() return value via PropertyChainDetector (verified by jose.ground-truth.test.ts line 254 SHOULD_FIRE passing)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/panva/jose/blob/v6.2.3/src/jwks/remote.ts, https://github.com/panva/jose/blob/v6.2.3/src/util/errors.ts, node_modules/jose/dist/types/jwks/remote.d.ts (jose@6.2.3), node_modules/jose/dist/webapi/jwks/remote.js (lines 124-143)
- **Verified by:** bc-deepen-contract drift-by-staleness mode (deepen-stream-2 pass 64 on 2026-06-24T08:02:30Z)

## 2026-06-18 — re-verified clean

- **Latest published:** jose@6.2.3
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** jose@6.2.3
- **Profile semver:** >=4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** jose@6.2.3
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** jose@6.2.3
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** jose@6.2.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** jose@>=4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
