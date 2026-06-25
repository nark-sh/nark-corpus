# CHANGELOG — @upstash/redis

## 2026-06-25 — re-verified clean

- **Latest published:** @upstash/redis@1.38.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass 13 — drift-mode coverage maintained at 100% (effective)

- **Profile:** `packages/@upstash/redis/contract.yaml`
- **Drift baseline compared:** v1.34.7 (April-era surface) → v1.38.0 (latest, 2026-05-05)
- **Functions added:** xadd, xgroup, xreadgroup, copy, flushdb (5 total)
- **Postconditions added:** 6
  - `xadd.wrongtype-or-network-error` — stream-append data-loss prevention
  - `xgroup.busygroup-or-nogroup-error` — consumer-group lifecycle
  - `xreadgroup.nogroup-error` — silent-halt on missing consumer group
  - `copy.copy-result-not-checked` — silent NOT_COPIED return value pattern
  - `copy.wrongtype-or-network-error` — copy network/WRONGTYPE
  - `flushdb.destructive-no-try-catch` — destructive admin op guardrail
- **Net-new API families enumerated (not all postconditioned this pass):**
  - Streams: xadd, xack, xackdel, xautoclaim, xclaim, xdelex, xgroup, xinfo, xpending, xrange, xread, xreadgroup, xrevrange, xtrim (Redis 7.4+ streams shipped to Upstash SDK)
  - Redis Functions: functions.load, functions.list, functions.delete, functions.flush, functions.stats, functions.call, functions.callRo
  - Hash field expiration: hexpire, hexpireat, hexpiretime, httl, hpexpire, hpexpireat, hpexpiretime, hpttl, hpersist
  - Misc: copy, flushdb, clientSetinfo, sintercard
- **Functions enumerated but intentionally omitted this pass:** xack, xtrim, xpending, xinfo, xrange, xrevrange, xautoclaim, xclaim, xdelex, xackdel (share xadd's error profile); functions.list/delete/flush/stats/call/callRo (rare in app code, error profile mirrors eval()); hash-field-expiration family (mirrors expire()'s profile)
- **Scanner concerns queued:** 6 (`concern-20260623-upstash-redis-deepen-stream3-pass13-xadd`, `-xgroup`, `-xreadgroup`, `-copy-result`, `-copy-network`, `-flushdb`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://redis.io/commands/xadd
  - https://redis.io/commands/xgroup
  - https://redis.io/commands/xreadgroup
  - https://redis.io/commands/copy
  - https://redis.io/commands/flushdb
  - https://upstash.com/docs/redis/sdks/ts/commands/stream/xadd
  - https://upstash.com/docs/redis/sdks/ts/commands/stream/xgroup
  - https://upstash.com/docs/redis/sdks/ts/commands/stream/xreadgroup
  - https://upstash.com/docs/redis/sdks/ts/commands/generic/copy
  - https://upstash.com/docs/redis/sdks/ts/commands/server/flushdb
- **Evidence path:** TypeScript declaration diff between
  `@upstash/redis@1.34.7/package/zmscore-hRk-rDLY.d.ts` and
  `@upstash/redis@1.38.0/package/error-8y4qG0W2.d.ts` (downloaded from npm registry)
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 13, 2026-06-23)

## 2026-06-18 — re-verified clean

- **Latest published:** @upstash/redis@1.38.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @upstash/redis@1.38.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @upstash/redis@1.38.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @upstash/redis@1.38.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @upstash/redis@1.38.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** @upstash/redis@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
