# CHANGELOG — @google-cloud/storage

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass (drift mode) — coverage 83% → 87%

- **Profile:** `packages/@google-cloud/storage/contract.yaml`
- **Functions added:** combine, moveFileAtomic, lock (3 total)
- **Postconditions added:** 9 (combine: 3, moveFileAtomic: 3, lock: 3)
- **Functions intentionally omitted this pass:** none new (existing omitted list unchanged)
- **Scanner concerns queued:** 9 (`concern-20260624-google-cloud-storage-deepen-1` ... `-9`)
- **Scanner version used:** nark@3.1.0 (package.json `nark-dev/nark`)
- **Sources fetched / verified:**
    - `https://cloud.google.com/storage/docs/json_api/v1/objects/compose`
    - `https://cloud.google.com/storage/docs/json_api/v1/objects/move`
    - `https://cloud.google.com/storage/docs/json_api/v1/buckets/lockRetentionPolicy`
    - `https://googleapis.dev/nodejs/storage/latest/Bucket.html#combine`
    - `https://googleapis.dev/nodejs/storage/latest/Bucket.html#lock`
    - `https://googleapis.dev/nodejs/storage/latest/File.html#moveFileAtomic`
- **Source code inspected:** node_modules/@google-cloud/storage@7.21.0 `build/cjs/src/bucket.js` (combine lines 1094-1175, lock lines 2529-2541), `build/cjs/src/file.js` (moveFileAtomic lines 2766-2824)
- **Key insights:**
    - **combine** has a hard 32-source ceiling at the GCS compose REST API. Common SaaS pattern for chunked-upload assembly silently bumps into this cap, stalling partial assembly workflows with a 400 that has no remediation hint.
    - **moveFileAtomic** only works on HNS (hierarchical namespace) buckets. Calling on a flat bucket throws HTTP 400; callers without try-catch silently assume atomicity they do not have. The only fallback is `file.move()` (non-atomic copy+delete) which can leave duplicate files: hidden DATA_LOSS class.
    - **lock** is irreversible. The `/lockRetentionPolicy` endpoint permanently freezes retention. A 412 precondition mismatch means metadata changed since read; a 400 means no retention policy exists; a 403 means insufficient role. Silent swallowing of any of these creates a COMPLIANCE_VIOLATION blast radius (HIPAA/SEC retention appears satisfied but bucket is still mutable).
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass=52, 2026-06-24)

## 2026-06-18 — re-verified clean

- **Latest published:** @google-cloud/storage@7.21.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @google-cloud/storage@7.21.0
- **Profile semver:** >=5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @google-cloud/storage@7.21.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @google-cloud/storage@7.21.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @google-cloud/storage@7.21.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @google-cloud/storage@>=5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
