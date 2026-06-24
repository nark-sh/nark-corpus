# CHANGELOG — ofetch

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (re-confirmed)

- **Profile:** `packages/ofetch/contract.yaml`
- **Functions added:** none (re-confirmed-complete)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** ofetch.create (sync factory, no Promise return), createFetch (sync factory), createFetchError (sync utility, not user-facing), ofetch.native (property pass-through to global fetch, not a callable distinct from native fetch)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** ofetch@1.5.1 dist/index.d.ts and dist/shared/ofetch.BbrTaNPp.d.ts (declaration files), dist/shared/ofetch.BBShr9Pz.cjs (source — confirmed FetchError throw, TimeoutError code 23, retry suppression on abort)
- **Verified by:** bc-deepen-contract (pass 77 on 2026-06-24T10:23Z)
- **Notes:** Full Phase 1 enumeration against ofetch@1.5.1 confirms the existing contract covers every async-callable surface. The `$Fetch` interface declares exactly three Promise-returning entrypoints — the callable `$Fetch(req, opts?)` (covered by `ofetch` and `$fetch` function entries) and `raw(req, opts?)` (covered by the `raw` entry). The remaining members of `$Fetch` are `native` (a property pointer to global fetch, not a distinct callable contract — `ofetch.native(req, init?)` is the same as calling global fetch and is documented as such) and `create(defaults, globalOptions?)` (a synchronous factory returning a new `$Fetch` instance). Source inspection in `dist/shared/ofetch.BBShr9Pz.cjs` confirms the three documented throw paths (FetchError on non-2xx, FetchError wrapping TimeoutError with name="TimeoutError" code=23 on timeout, immediate failure without retry for POST/PUT/PATCH/DELETE on retryable status codes) are unchanged at v1.5.1. Coverage stays at 3/3 = 1.0; metadata.coverage_score remains 1.0 in contract.yaml; last_verified bumped to 2026-06-24.

## 2026-06-18 — re-verified clean

- **Latest published:** ofetch@1.5.1
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ofetch@1.5.1
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ofetch@1.5.1
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** ofetch@1.5.1
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ofetch@1.5.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** ofetch@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
