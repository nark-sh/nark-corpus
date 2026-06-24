# CHANGELOG — @vercel/blob

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 88% -> 90%

- **Profile:** `packages/@vercel/blob/contract.yaml`
- **Functions added:** issueSignedToken, presignUrl, handleUploadPresigned, uploadPresigned (4 total)
- **Postconditions added:** 7 (issue-signed-token-no-try-catch, issue-signed-token-valid-until-in-past, presign-url-no-try-catch, presign-url-delegation-expired, handle-upload-presigned-no-try-catch, handle-upload-presigned-missing-webhook-public-key, upload-presigned-no-try-catch)
- **Functions intentionally omitted this pass:** parseStoreIdFromDelegationToken (sync JWT-payload decoder, no I/O), parseStoreIdFromPresignedUrl (sync wrapper around above, no I/O)
- **Scanner concerns queued:** 4 (`concern-20260624-vercel-blob-deepen-1` ... `concern-20260624-vercel-blob-deepen-4`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://vercel.com/docs/vercel-blob/using-blob-sdk, https://github.com/vercel/storage/blob/main/packages/blob/src/signed-token.ts, https://github.com/vercel/storage/blob/main/packages/blob/src/client.ts (cross-referenced against installed @vercel/blob@2.4.1 dist/index.d.ts, dist/client.d.ts, dist/chunk-HZSIXSMY.cjs)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T04:08:44Z, deepen-stream-2 pass 42, drift-by-staleness mode)

## 2026-06-18 — re-verified clean

- **Latest published:** @vercel/blob@2.4.1
- **Profile semver:** `>=0.19.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @vercel/blob@2.4.0
- **Profile semver:** >=0.19.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @vercel/blob@2.4.0
- **Profile semver:** `>=0.19.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @vercel/blob@2.4.0
- **Profile semver:** `>=0.19.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @vercel/blob@2.4.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @vercel/blob@>=0.19.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
