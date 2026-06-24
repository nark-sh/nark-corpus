# CHANGELOG — simple-oauth2

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verification)

- **Profile:** `packages/simple-oauth2/contract.yaml`
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Latest published:** simple-oauth2@5.1.0
- **API surface re-enumerated:** 6 async-callable methods (getToken across 3 grant-type classes, refresh, revoke, revokeAll)
- **Functions added:** none (re-verification — surface unchanged since 2026-04-17 deepen)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** authorizeURL (sync URL builder), createToken (sync factory), expired (sync boolean), toJSON (sync serializer)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources re-inspected:**
  - `node_modules/simple-oauth2/lib/access-token.js` — async refresh/revoke/revokeAll confirmed
  - `node_modules/simple-oauth2/lib/{authorization-code,client-credentials,resource-owner-password}-grant-type.js` — async getToken confirmed
  - `node_modules/simple-oauth2/index.js` — top-level exports confirmed (AuthorizationCode, ClientCredentials, ResourceOwnerPassword)
- **Verified by:** bc-deepen-contract (drift-by-staleness pass, deepen-stream-3 pass 64)

## 2026-06-18 — re-verified clean

- **Latest published:** simple-oauth2@5.1.0
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** simple-oauth2@5.1.0
- **Profile semver:** >=4.0.0 <6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** simple-oauth2@5.1.0
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** simple-oauth2@5.1.0
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** simple-oauth2@5.1.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** simple-oauth2@>=4.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
