# CHANGELOG — @aws-sdk/s3-request-presigner

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (function count); postcondition density 6 -> 7

- **Profile:** `packages/@aws-sdk/s3-request-presigner/contract.yaml`
- **Functions added:** none (all 3 surfaces already contracted)
- **Postconditions added:** 1 (`getSignedUrl.presigner-not-valid-http-request`)
- **Functions intentionally omitted this pass:** none (no read-only / pure-GET surfaces to omit)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/@aws-sdk/s3-request-presigner@3.1075.0/dist-es/getSignedUrl.js` (throw of `Error("Request to be presigned is not an valid HTTP request.")`)
  - `node_modules/@aws-sdk/s3-request-presigner@3.1075.0/dist-es/presigner.js` (re-verified no new throws on presign/presignWithCredentials in this build)
  - `node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js` (re-verified SigV4a / MRAP / CRT branch throws unchanged)
  - `node_modules/@smithy/signature-v4/dist-es/SignatureV4.js` and `SignatureV4Base.js` (re-verified MAX_PRESIGNED_TTL and invalid-credential-object throws unchanged)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T01:38:48Z, deepen-stream-2 pass 29)


## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/s3-request-presigner@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/s3-request-presigner@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/s3-request-presigner@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/s3-request-presigner@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/s3-request-presigner@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** @aws-sdk/s3-request-presigner@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
