# CHANGELOG — plaid

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 83% → 85%

- **Profile:** `packages/plaid/contract.yaml`
- **Functions added:** assetReportCreate, identityVerificationCreate, processorTokenCreate (3 total)
- **Postconditions added:** 9 (3 per new function)
- **Functions intentionally omitted this pass:** none new (the 4 institutional read-only methods remain omitted)
- **Scanner concerns queued:** 3 (`concern-20260624-plaid-deepen-1`, `concern-20260624-plaid-deepen-2`, `concern-20260624-plaid-deepen-3`)
- **Scanner version used:** nark@3.2.0 (per nark-dev/nark/package.json)
- **Sources fetched:**
  - https://plaid.com/docs/api/products/assets/#assetreportcreate
  - https://plaid.com/docs/errors/asset-report/
  - https://plaid.com/docs/api/products/identity-verification/#identity_verificationcreate
  - https://plaid.com/docs/errors/invalid-input/
  - https://plaid.com/docs/api/processors/#processortokencreate
  - https://plaid.com/docs/errors/item/
  - https://plaid.com/docs/errors/rate-limit-exceeded/
- **Verified by:** bc-deepen-contract (pass 28, deepen-stream-2, 2026-06-24T02:00:00Z)


## 2026-06-18 — re-verified clean

- **Latest published:** plaid@42.2.0
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** plaid@42.2.0
- **Profile semver:** >=9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** plaid@42.2.0
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** plaid@42.2.0
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** plaid@42.2.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** plaid@>=9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
