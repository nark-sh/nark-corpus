# CHANGELOG — axios-retry

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass (+1 function, +1 postcondition)

- **Latest published:** axios-retry@4.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** depth pass — added `onMaxRetryTimesExceeded` contract entry covering async error-swallowing on final-failure handlers
- **New function:** `axiosRetry (onMaxRetryTimesExceeded async error swallowing)`
- **New postcondition:** `on-max-retry-times-exceeded-error-replaces-original-error` — mirrors the `onRetry` swallowing hazard but at the post-exhaustion lifecycle point; documents that throws from alerting / fallback writes inside `onMaxRetryTimesExceeded` propagate up and replace the original AxiosError, silently destroying retry-exhaustion diagnostics
- **Coverage:** 6/8 (0.75) → 7/9 (0.78) raw; effective remains 1.0 (all callable-with-throw functions covered)
- **Evidence:**
  - `axios-retry@4.5.0/dist/cjs/index.d.ts` line 30 — `onMaxRetryTimesExceeded?: (error, retryCount) => Promise<void> | void`
  - `axios-retry@4.5.0/dist/cjs/index.js` lines 195–199 — `handleMaxRetryTimesExceeded` awaits `currentState.onMaxRetryTimesExceeded(error, retryCount)`
  - `axios-retry@4.5.0/dist/cjs/index.js` line 226 — sequence is `yield handleMaxRetryTimesExceeded(...); return Promise.reject(error);` — if the yielded await throws, the reject never runs
  - README options table — "After all the retries are failed, this callback will be called with the last error before throwing the error"
- **Ground-truth fixture:** added 1 SHOULD_FIRE + 1 SHOULD_NOT_FIRE case (`fetchWithUnsafeOnMaxRetry` / `fetchWithSafeOnMaxRetry`)
- **Contract version:** 1.1.0 → 1.2.0
- **Scanner version used:** nark@3.1.0
- **Deepened by:** bc-deepen-contract (deepen-stream-3 pass 8)

## 2026-06-18 — re-verified clean

- **Latest published:** axios-retry@4.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** axios-retry@4.5.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** axios-retry@4.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** axios-retry@4.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** axios-retry@4.5.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** axios-retry@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
