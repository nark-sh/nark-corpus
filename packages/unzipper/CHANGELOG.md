# CHANGELOG — unzipper

## 2026-06-25 — re-verified clean

- **Latest published:** unzipper@0.12.5
- **Profile semver:** >=0.9.0 <0.13.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen re-verification — coverage 75% -> 75%

- **Profile:** `packages/unzipper/contract.yaml`
- **Latest published:** unzipper@0.12.5 (inspected 0.12.3 locally — same minor family)
- **Functions added:** none (re-verification pass)
- **Postconditions added:** 0
- **API surface walked:** 12 async-callable operations (Parse, ParseOne, Extract, Open.buffer, Open.file, Open.url, Open.s3, Open.s3_v3, Open.custom, CentralDirectory.extract, Entry.buffer, PullStream.pull) — unchanged from 2026-04-17 pass
- **Functions intentionally omitted this pass:** Open.s3 (deprecated AWS SDK v2), Open.custom (same error profile as Open.file/buffer), PullStream.pull (internal API)
- **Scanner concerns queued:** 0 (no new postconditions to detect)
- **Scanner version used:** nark@3.2.0
- **Sources inspected:**
  - `node_modules/unzipper/unzip.js`
  - `node_modules/unzipper/lib/Open/index.js`
  - `node_modules/unzipper/lib/Open/directory.js`
  - `node_modules/unzipper/lib/parse.js`
  - `node_modules/unzipper/lib/parseOne.js`
  - `node_modules/unzipper/lib/extract.js`
- **Verdict:** Coverage unchanged (9 contracted / 12 total = 0.75; effective coverage 9/9 non-omitted = 1.0). No new exported async functions since 2026-04-17. Profile remains at full effective coverage.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 70 on 2026-06-24T09:08:24Z)

## 2026-06-18 — re-verified clean

- **Latest published:** unzipper@0.12.3
- **Profile semver:** `>=0.9.0 <0.13.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** unzipper@0.12.3
- **Profile semver:** >=0.9.0 <0.13.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** unzipper@0.12.3
- **Profile semver:** `>=0.9.0 <0.13.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** unzipper@0.12.3
- **Profile semver:** `>=0.9.0 <0.13.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** unzipper@0.12.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** unzipper@>=0.9.0 <0.13.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
