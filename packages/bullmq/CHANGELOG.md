# CHANGELOG — bullmq

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-23 — deepen pass — coverage 100% → 100% (surface +4)

- **Profile:** `packages/bullmq/contract.yaml`
- **Functions added:** Queue.promoteJobs, Queue.removeOrphanedJobs, Queue.rateLimit, Queue.setGlobalConcurrency (4 total)
- **Postconditions added:** 4 (queue-promotejobs-redis-error, queue-removeorphanedjobs-redis-error, queue-ratelimit-redis-error, queue-setglobalconcurrency-redis-error)
- **Functions intentionally omitted this pass:** Queue.setGlobalRateLimit, Queue.removeGlobalConcurrency, Queue.removeGlobalRateLimit, Queue.getGlobalRateLimit (identical HSET-on-meta error profile to setGlobalConcurrency, already covered); Queue.getMeta, Queue.getJobScheduler, Queue.getJobSchedulers, Queue.getJobSchedulersCount (read-only getters); Queue.removeDeduplicationKey, Queue.removeRateLimitKey, Queue.removeDebounceKey, Queue.trimEvents, Queue.removeDeprecatedPriorityKey (single-Redis-op cleanup methods, generic Redis-connection error already covered)
- **Scanner concerns queued:** 4 (`concern-20260623-bullmq-deepen-1`, `concern-20260623-bullmq-deepen-2`, `concern-20260623-bullmq-deepen-3`, `concern-20260623-bullmq-deepen-4`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** `node_modules/bullmq/dist/esm/classes/queue.js` (5.79.1 source), https://api.docs.bullmq.io/classes/v5.Queue.html, https://raw.githubusercontent.com/taskforcesh/bullmq/master/docs/gitbook/changelog.md
- **Verified by:** bc-deepen-contract (pass on 2026-06-23 — drift-by-staleness re-enumeration vs 2026-04-04 deepen)

## 2026-06-18 — re-verified clean

- **Latest published:** bullmq@5.79.0
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** bullmq@5.78.1
- **Profile semver:** >=5.0.0 <6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** bullmq@5.78.1
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** bullmq@5.78.1
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** bullmq@5.78.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-14 — backfilled

- **Verified against:** bullmq@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
