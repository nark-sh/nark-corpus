# CHANGELOG — replicate

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 1.0 → 1.0 (+1 function)

- **Profile:** `packages/replicate/contract.yaml`
- **Functions added:** `deployments.create` (1 total)
- **Postconditions added:** 2 (`deployments-create-no-error-handling`, `deployments-create-not-yet-ready`)
- **Functions intentionally omitted this pass:** read-only GETs across accounts/collections/deployments/files/hardware/models/predictions/trainings/webhooks (no distinct error contract beyond generic ApiError already covered by sibling postconditions); generic `request()` / `paginate()` helpers (errors propagate from underlying endpoint calls); low-frequency mutating methods `deployments.update`, `deployments.delete`, `models.create`, `predictions.cancel`, `trainings.cancel`, `files.delete` (idempotent or ApiError-only failure modes); `parseProgressFromLogs` (synchronous, no I/O)
- **Scanner concerns queued:** 2 (`concern-20260624-replicate-deepen-1`, `concern-20260624-replicate-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://registry.npmjs.org/replicate/-/replicate-1.4.0.tgz, https://github.com/replicate/replicate-javascript/blob/main/lib/deployments.js, https://github.com/replicate/replicate-javascript/blob/main/index.js, https://replicate.com/docs/topics/deployments, https://replicate.com/docs/reference/http#deployments.create
- **Drift trigger:** stale-by-69d (`last_deepened` was 2026-04-16; tied for oldest unblocked public-tier entry on this pass)
- **API surface re-enumeration:** prior pass counted 19 async-callable methods; fresh `index.d.ts` walk surfaces 35. Recount corrects historical undercount; coverage remains 1.0 because the 26 newly-visible methods are all read-only or low-frequency mutating with generic-ApiError-only failure modes already covered by the 9 contracted methods.
- **Verified by:** bc-deepen-contract (pass 52 on 2026-06-24)

## 2026-06-18 — re-verified clean

- **Latest published:** replicate@1.4.0
- **Profile semver:** `>=0.16.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** replicate@1.4.0
- **Profile semver:** >=0.16.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** replicate@1.4.0
- **Profile semver:** `>=0.16.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** replicate@1.4.0
- **Profile semver:** `>=0.16.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** replicate@1.4.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** replicate@>=0.16.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
