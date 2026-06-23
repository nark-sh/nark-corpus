# CHANGELOG — ioredis

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass 15 — coverage 83% → 100%

- **Profile:** `packages/ioredis/contract.yaml`
- **Functions added:** exec, exists, getex, getdel (4 total)
- **Postconditions added:** 10 (exec-results-not-checked, exec-null-return-not-checked, exec-unhandled-promise-rejection, exists-unhandled-promise-rejection, exists-return-coerced-to-boolean-without-zero-check, getex-wrong-type-error, getex-unhandled-promise-rejection, getex-invalid-ttl-arguments, getdel-wrong-type-error, getdel-unhandled-promise-rejection, getdel-null-return-not-distinguished-from-error)
- **Functions intentionally omitted this pass:** scan / hscan / sscan / zscan (cursor streams via scanStream wrapper — sync, return Streams), xadd / xread (Redis Streams, narrow SaaS adoption)
- **await_patterns added:** `.exists(`, `.getex(`, `.getdel(` (`.exec(` was already present)
- **Scanner concerns queued:** 4 (`concern-20260623-ioredis-deepen-1` exec results-iteration flow analysis, `concern-20260623-ioredis-deepen-2` exists boolean-coercion AST detection, `concern-20260623-ioredis-deepen-3` getex TTL-argument provenance, `concern-20260623-ioredis-deepen-4` getdel null-vs-rejection log discrimination)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://redis.io/commands/exists/, https://redis.io/commands/getex/, https://redis.io/commands/getdel/, https://redis.io/commands/exec/, https://github.com/redis/ioredis#pipelining, https://github.com/redis/ioredis#transactions, https://redis.io/docs/latest/develop/clients/error-handling/, https://github.com/redis/ioredis/issues/883; source-of-truth from ioredis@5.11.1 RedisCommander.d.ts (lines 1887, 1894-1897, 2345, 2353-2364)
- **Fixtures:** ground-truth.ts gained 8 cases (sections 9-12: exec / exists / getex / getdel with paired NoCatch SHOULD_FIRE + WithCatch SHOULD_NOT_FIRE). All 26 ground-truth tests pass.
- **Validation:** nark-corpus `npm run validate` — All 191 contracts valid.
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T23:35:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** ioredis@5.11.1
- **Profile semver:** `>=4.27.8` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ioredis@5.11.1
- **Profile semver:** >=4.27.8 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ioredis@5.11.1
- **Profile semver:** `>=4.27.8` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** ioredis@5.11.1
- **Profile semver:** `>=4.27.8` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ioredis@5.11.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-02 — backfilled

- **Verified against:** ioredis@>=4.27.8
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
