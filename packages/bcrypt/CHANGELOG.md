# CHANGELOG — bcrypt

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-24 — deepen pass — coverage 100% → 100% (depth, not surface)

- **Profile:** `packages/bcrypt/contract.yaml`
- **Functions added:** none (all 7 callable exports already covered)
- **Postconditions added:** 2 (`compare.compare-callback-position-swap`, `hash.hash-callback-position-swap`)
- **Postconditions updated:** 1 (`compare.invalid-args` — fixed drift: v6 async path emits `'data and hash must be strings'`, sync path still emits the longer message; existing `throws` text was the sync message only)
- **Functions intentionally omitted this pass:** none
- **Scanner concerns queued:** 0 (the swap-fn footgun requires cross-arg typeof analysis that is out of scope for a routine deepen pass; documented for awareness)
- **Scanner version used:** nark@(workspace HEAD)
- **Sources fetched:** `node_modules/bcrypt/bcrypt.js@6.0.0` (lines 108-120 for `hash`, 179-191 for `compare`), `node_modules/bcrypt/promises.js@6.0.0`, https://github.com/kelektiv/node.bcrypt.js/blob/master/bcrypt.js, https://github.com/kelektiv/node.bcrypt.js/blob/master/README.md, `node_modules/bcrypt/CHANGELOG.md@6.0.0`
- **Verified by:** bc-deepen-contract (pass 32 on 2026-06-24T02:03:51Z, deepen-stream-2)
- **Notes:** the two new postconditions describe a class of misuse (swap-fn) where the returned value of `bcrypt.hash`/`bcrypt.compare` is `undefined` (no Promise constructed), the Error is invoked on the wrong argument via `process.nextTick`, and a try-catch around `await` does NOT catch the misuse. Auth-check symptom for `compare` is silent rejection of valid credentials; registration symptom for `hash` is a `null`/`undefined` persisted password hash. `npm run validate` passes for all 191 contracts post-edit.

## 2026-06-18 — re-verified clean

- **Latest published:** bcrypt@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** bcrypt@6.0.0
- **Profile semver:** >=5.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** bcrypt@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** bcrypt@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** bcrypt@6.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** bcrypt@6.0.0
- **Profile semver:** `>=5.0.0 <6.0.0` → `>=5.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes in v6 — pure build toolchain change (node-pre-gyp replaced with prebuildify); zero API or error behavior changes
- **Changelog evidence:** v6.0.0: "Drop support for NodeJS <= 16", "Remove node-pre-gyp in favor of prebuildify", "Update node-addon-api to 8.3.0" — no hash/compare API or throw behavior changes
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-16 — backfilled

- **Verified against:** bcrypt@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
