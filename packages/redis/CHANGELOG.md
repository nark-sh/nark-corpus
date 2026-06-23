# CHANGELOG — redis

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 22→27 contracted (effective 1.0 → 1.0)

- **Profile:** `packages/redis/contract.yaml`
- **Functions added:** close, watch, createClientPool, execute, sendCommand (5 total)
- **Postconditions added:** 5 (one per new function)
- **Functions intentionally omitted this pass:** none — five v5+ public-API additions absorbed
- **Scanner concerns queued:** 0 — existing await_patterns + factory_methods system already
  detects the new methods (close, watch, sendCommand, execute added to await_patterns;
  createClientPool added to factory_methods). All 55 redis ground-truth tests pass.
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://github.com/redis/node-redis/blob/master/docs/v4-to-v5.md (close/destroy/createClientPool)
  - https://github.com/redis/node-redis/blob/master/docs/v5-to-v6.md (RESP3 default; no API additions)
  - https://redis.io/docs/latest/develop/clients/nodejs/transpipe/ (watch + pool.execute + WatchError)
  - @redis/client@6.x dist/lib/errors.d.ts (ClientClosedError, WatchError, AbortError, MultiErrorReply)
- **Coverage notes:** profile was already at effective 1.0 (22/22 non-omitted). This pass
  re-enumerates the v5/v6 API surface against the live redis@6.0.0 package and adds five
  postconditions that document v5+ public-API additions the original v4-era 2026-04-02
  pass could not anticipate. Effective coverage stays 1.0 (27/27 non-omitted) because the
  new entries are all real contracted functions, not omissions. Raw score still 1.0 by
  the contracted/(total-omitted) formula. contract_version bumped 1.0.0 → 1.1.0 (minor:
  new function entries, backward-compatible).
- **Verified by:** bc-deepen-contract (pass 12 on 2026-06-23T22:00:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:** >=5.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** redis@6.0.0
- **Profile semver:** `>=5.0.0 <6.0.0` → `>=5.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes between v5 and v6 — RESP3 default is a wire-level change; `.on('error')` handler requirement and ECONNREFUSED throw patterns are unchanged
- **Changelog evidence:** v6.0.0 release notes: "RESP3 is now the default protocol", "Raise minimum Node.js engine to 20" — no error class or API changes
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-06 — backfilled

- **Verified against:** redis@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
