# CHANGELOG — request-promise

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 73% → 64%

- **Profile:** `packages/request-promise/contract.yaml`
- **Functions added:** options, delete (2 total)
- **Postconditions added:** 4 (options: http-error-4xx-5xx + network-failure; delete: http-error-4xx-5xx + network-failure)
- **Functions intentionally omitted this pass:** `defaults` (sync factory), `jar` (sync utility), `cookie` (sync utility), `bindCLS` (synchronous-throw upgrade sentinel — request-promise/lib/rp.js lines 47-49), `forever` (sync factory returning request.defaults-configured handle, no async behavior of its own)
- **Scanner concerns queued:** 2 (`concern-20260624-request-promise-deepen-1` for rp.options() detection, `concern-20260624-request-promise-deepen-2` for rp.delete() alias detection)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/request/index.js (verb table at lines 66-73), node_modules/request-promise-core/configure/request2.js (Request.prototype.init interception), node_modules/request-promise/lib/rp.js (bindCLS sync-throw), empirical verification (rp.options + rp.delete both produce thenables that reject with RequestError on network failure against `http://localhost:1`)
- **Coverage accounting note:** total surface grew from 11 to 14 because the prior pass under-counted: `forever` (sync factory, omitted), `bindCLS` (sync throw, omitted), and the `delete` alias of `del` (now contracted as a distinct entry) were not enumerated. The new denominator yields a lower raw coverage_score (0.64 vs prior 0.73) but `effective_coverage` (contracted / eligible-async) is 1.0 — every async-callable function on request-promise's surface now has at least one postcondition.
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T11:14:03Z, deepen-stream-3 pass 72)


## 2026-06-18 — re-verified clean

- **Latest published:** request-promise@4.2.6
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** request-promise@4.2.6
- **Profile semver:** >=4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** request-promise@4.2.6
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** request-promise@4.2.6
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** request-promise@4.2.6
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** request-promise@>=4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
