# CHANGELOG — @nestjs/jwt

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (density-deepened)

- **Profile:** `packages/@nestjs/jwt/contract.yaml`
- **Mode:** drift-mode density-deepen (no new functions; deepened postcondition density per function)
- **Functions added:** (none — 4/4 already contracted)
- **Postconditions added:** 2
  - `signAsync.sign-async-sync-throw-on-string-payload-with-options` (error) — signAsync() throws synchronously before constructing the Promise when payload is a string and signOptions contain disallowed keys; `.catch()` cannot save you
  - `verifyAsync.verify-async-misconfigured-secret-unhandled-rejection` (warning) — JwtService instantiated without any secret/publicKey/secretOrKeyProvider rejects only on the first verify call, easy to ship to staging undetected
- **Functions intentionally omitted this pass:** decode (returns null, never throws), JwtService constructor (DI-managed)
- **Scanner concerns queued:** 2 (`concern-20260624-nestjs-jwt-deepen-3`, `concern-20260624-nestjs-jwt-deepen-4`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/nestjs/jwt/blob/master/lib/jwt.service.ts (canonical source)
  - `node_modules/@nestjs/jwt/dist/jwt.service.js` v11.0.2 (lines 48-51 for signAsync sync-throw; lines 69-78 + getSecretKey 101-114 for verifyAsync misconfig)
  - https://github.com/auth0/node-jsonwebtoken/blob/master/verify.js (rejection contract)
- **Contract version bump:** 1.1.0 → 1.2.0
- **`last_verified`:** 2026-04-15 → 2026-06-24
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 36, 2026-06-24T02:47:40Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @nestjs/jwt@11.0.2
- **Profile semver:** `>=9.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @nestjs/jwt@11.0.2
- **Profile semver:** >=9.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @nestjs/jwt@11.0.2
- **Profile semver:** `>=9.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @nestjs/jwt@11.0.2
- **Profile semver:** `>=9.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @nestjs/jwt@11.0.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-15 — backfilled

- **Verified against:** @nestjs/jwt@>=9.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
