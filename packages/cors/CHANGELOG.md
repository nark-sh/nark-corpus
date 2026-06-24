# CHANGELOG — cors

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (re-confirm)

- **Profile:** `packages/cors/contract.yaml`
- **Functions added:** none (cors is fully synchronous — no async surface to enumerate)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** none new (cors() is the only callable export; all option callbacks use Node-style `(err, result) => void` pattern, no Promises)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** `npm view cors version` → 2.8.6 (unchanged since prior pass); contract.yaml inspected; no upstream version bump since 2026-04-18 deepen
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 65 on 2026-06-24T10:09:37Z)
- **Verdict:** RE-CONFIRMED-COMPLETE. cors@2.8.6 published API surface is unchanged. 1/1 callable exports remain contracted with 4 postconditions on cors(): wildcard-origin-no-protection, origin-reflection-no-validation, credentials-with-wildcard-invalid, delegate-error-propagation. `evidence_quality: confirmed` retained.

## 2026-06-18 — re-verified clean

- **Latest published:** cors@2.8.6
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** cors@2.8.6
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** cors@2.8.6
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** cors@2.8.6
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** cors@2.8.6
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** cors@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
