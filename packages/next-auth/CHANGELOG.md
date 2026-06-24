# CHANGELOG — next-auth

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 95% → 100%

- **Profile:** `packages/next-auth/contract.yaml`
- **Functions added:** getCsrfToken, getProviders (2 total)
- **Postconditions added:** 2 (getcsrftoken-undefined-not-checked, getproviders-null-not-checked)
- **Functions intentionally omitted this pass:** unstable_getServerSession — documented @deprecated alias of getServerSession with identical runtime behavior; flagging it would penalize callers who already migrated
- **Scanner concerns queued:** 2 (`concern-20260623-next-auth-deepen-1`, `concern-20260623-next-auth-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://next-auth.js.org/getting-started/client (getCsrfToken and getProviders sections), node_modules/next-auth/client/_utils.js (fetchData error-swallowing implementation), node_modules/next-auth/react/index.js (getCsrfToken/getProviders bodies)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T00:22Z)

## 2026-06-18 — re-verified clean

- **Latest published:** next-auth@4.24.14
- **Profile semver:** `^4.22.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** next-auth@4.24.14
- **Profile semver:** ^4.22.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** next-auth@4.24.14
- **Profile semver:** `^4.22.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** next-auth@4.24.14
- **Profile semver:** `^4.22.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** next-auth@4.24.14
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-04 — backfilled

- **Verified against:** next-auth@^4.22.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
