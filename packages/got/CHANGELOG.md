# CHANGELOG — got

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 87% → 100%

- **Profile:** `packages/got/contract.yaml`
- **Functions added:** paginate.all, stream.get, stream.post, stream.put, stream.patch, stream.head, stream.delete (7 total)
- **Postconditions added:** 9 (2 on paginate.all: paginate-all-http-error, paginate-all-network-error; 1 stream-alias-error-event shared across stream.get/post/put/patch/head/delete; 1 edge case stream-alias-post-hangs-without-body on stream.get)
- **Functions intentionally omitted this pass:** create (synchronous Got factory), calculateRetryDelay (sync utility), parseLinkHeader (sync utility) — all three are pure synchronous exports with no Promise return type
- **Scanner concerns queued:** 2 (`concern-20260623-got-deepen-1` for got.paginate.all bare-await detection; `concern-20260623-got-deepen-2` for got.stream.\<HTTPAlias\> property-chain matcher)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/sindresorhus/got/main/documentation/3-streams.md
  - https://raw.githubusercontent.com/sindresorhus/got/main/documentation/4-pagination.md
  - https://raw.githubusercontent.com/sindresorhus/got/main/source/create.ts
  - dist/source/index.d.ts (v15.0.6 published TypeScript declarations)
  - dist/source/types.d.ts (GotPaginate / GotStream / Got<> shape)
  - dist/source/as-promise/types.d.ts (RequestPromise chain methods)
  - dist/source/core/errors.d.ts (RequestError hierarchy)
  - dist/source/create.js lines 227-237 (paginate.all + stream.\<method\> implementation)
- **Verified by:** bc-deepen-contract (pass 27, deepen-stream-2, 2026-06-23T01:07:47Z)


## 2026-06-18 — re-verified clean

- **Latest published:** got@15.0.5
- **Profile semver:** `>=12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** got@15.0.5
- **Profile semver:** >=12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** got@15.0.5
- **Profile semver:** `>=12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** got@15.0.5
- **Profile semver:** `>=12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** got@15.0.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-11 — backfilled

- **Verified against:** got@>=12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
