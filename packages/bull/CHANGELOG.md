# CHANGELOG — bull

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** bull@4.16.5
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** bull@4.16.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — deepen pass — coverage 74% → 84%

- **Profile:** `packages/bull/contract.yaml`
- **Functions added:** `Job.moveToCompleted`, `Job.takeLock`, `Queue.pause` (3 total)
- **Postconditions added:** 7 (move-to-completed-return-value-not-serializable, move-to-completed-no-try-catch, take-lock-false-return-unchecked, take-lock-no-try-catch, pause-no-try-catch, pause-local-hangs-on-stuck-job; plus ground-truth test cases)
- **Functions intentionally omitted this pass:** `Job.discard` (synchronous-only, sets flag); `Job.getState` (read-only query); `Job.isCompleted/isFailed/isDelayed/isActive/isWaiting/isPaused/isStuck` (all read-only boolean checks); `Queue.resume` (mirrors pause, no additional error contracts)
- **Scanner concerns queued:** 4 (`concern-20260611-bull-deepen-14` through `-17`)
- **Scanner version used:** nark@1.0.x (check `nark-dev/nark/package.json`)
- **Sources fetched:** `https://github.com/OptimalBits/bull/blob/master/lib/job.js`, `https://github.com/OptimalBits/bull/blob/master/lib/scripts.js`, `https://github.com/OptimalBits/bull/blob/master/lib/queue.js` — confirmed from bull@4.16.5 source
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T22:30:00Z)

## 2026-04-17 — backfilled

- **Verified against:** bull@>=3.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
