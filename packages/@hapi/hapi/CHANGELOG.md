# CHANGELOG — @hapi/hapi

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** @hapi/hapi@21.4.9
- **Profile semver:** `>=21.0.0 <22.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @hapi/hapi@21.4.9
- **Profile semver:** >=21.0.0 <22.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @hapi/hapi@21.4.9
- **Profile semver:** `>=21.0.0 <22.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @hapi/hapi@21.4.9
- **Profile semver:** `>=21.0.0 <22.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @hapi/hapi@21.4.9
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 83% → 100%

- **Profile:** `packages/@hapi/hapi/contract.yaml`
- **Functions added:** `inject` (1 total)
- **Postconditions added:** 3 (`inject-deprecated-credentials-option`, `inject-auth-options-malformed`, `inject-handler-throws-boom-error`)
- **Functions intentionally omitted this pass:** `cache.provision` (admin/init only, 0 corpus uses; covered de facto by initialize-cache-start-error), `states.format` and `states.parse` (cookie utilities, 0 corpus uses), `events.once` (event listener wait, sync-invariant-only failure)
- **Scanner concerns queued:** 3 (`concern-20260612-hapi-hapi-deepen-1`, `concern-20260612-hapi-hapi-deepen-2`, `concern-20260612-hapi-hapi-deepen-3`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://github.com/hapijs/hapi/blob/master/API.md (official server.inject docs — Boom error rethrow with .data partial response)
  - https://github.com/hapijs/hapi/blob/master/lib/server.js (lines 306–360 — Hoek.asserts for credentials/auth and `throw custom.error` rethrow)
  - https://github.com/hapijs/hapi/blob/master/lib/core.js (cache provision context for omission)
- **API surface re-enumerated against:** @hapi/hapi@21.4.9 (`lib/types/server/server.d.ts`)
- **Coverage math:** 8/8 contracted/non-omitted (12 async-callable total: initialize, start, stop, register, inject, auth.test, auth.verify, route + 4 intentionally omitted listed above). Raw 8/12 = 0.67; effective 1.0.
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T17:05:00Z)

## 2026-04-11 — backfilled

- **Verified against:** @hapi/hapi@>=21.0.0 <22.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
