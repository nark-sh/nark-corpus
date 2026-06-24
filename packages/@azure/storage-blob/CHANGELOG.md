# CHANGELOG — @azure/storage-blob

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 76% → 88%

- **Profile:** `packages/@azure/storage-blob/contract.yaml`
- **Profile semver:** `>=12.0.0` (unchanged)
- **Package version inspected:** @azure/storage-blob@12.32.0
- **Functions added:** `BlobClient.exists`, `BlobClient.deleteIfExists`, `BlobClient.setTags` (3 total)
- **Postconditions added:** 8 (2 exists + 3 deleteIfExists + 3 setTags)
- **Functions previously intentionally-omitted, now promoted to contracted:**
  - `BlobClient.deleteIfExists` — promoted because the "safe variant, no distinct throw" classification was wrong; the wrapper only swallows 404 BlobNotFound. The 409 SnapshotsPresent silent-bug, 412 LeaseIdMissing, 403 auth, and 429 throttling errors all propagate. This is the same critical production hazard as `delete()` and deserves explicit postconditions.
  - `BlobClient.setTags` / `BlobClient.getTags` — promoted because @azure/storage-blob 12.30.0 (2026-01-16) added conditional-headers support (ifTags / ifMatch / ifNoneMatch) to tag operations, introducing a NEW 412 PreconditionFailed scenario not present in 12.0–12.29.x. The profile semver is `>=12.0.0` so the contract must cover it. Validation errors (400 InvalidInput) and 404 BlobNotFound also need explicit handling.
- **Scanner concerns queued:** 0 (the 3 new functions inherit existing RestError detection from the parent surface; no scanner upgrade required)
- **Drift driver:** package versions 12.30.0, 12.31.0, 12.32.0 shipped since last_verified (2026-04-16). 12.30.0 added conditional headers on tag ops (new 412 mode). 12.31.0 added readableStreamBody.destroy() (informational, no contract change). 12.32.0 added Delete Blob Conditional Tier, Server-side Encryption Rekeying, and Cross-tenant Principal-Bound User Delegation SAS (new auth modes — covered by existing getUserDelegationKey postconditions).
- **GHSA check:** Azure/azure-sdk-for-js shows no published security advisories — no CVE-driven postconditions to add.
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/CHANGELOG.md (drift baseline)
  - https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobclient#@azure-storage-blob-blobclient-exists
  - https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobclient#@azure-storage-blob-blobclient-deleteifexists
  - https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobclient#@azure-storage-blob-blobclient-settags
  - https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobclient#@azure-storage-blob-blobclient-gettags
  - https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes
  - https://learn.microsoft.com/en-us/rest/api/storageservices/blob-tags
- **Source-verified:** node_modules/@azure/storage-blob/dist/commonjs/Clients.js lines 381-401 (exists), 476-497 (deleteIfExists), 590-625 (setTags/getTags)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 31 on 2026-06-24T02:52:39Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @azure/storage-blob@12.32.0
- **Profile semver:** `>=12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @azure/storage-blob@12.32.0
- **Profile semver:** >=12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @azure/storage-blob@12.32.0
- **Profile semver:** `>=12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @azure/storage-blob@12.32.0
- **Profile semver:** `>=12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @azure/storage-blob@12.32.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @azure/storage-blob@>=12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
