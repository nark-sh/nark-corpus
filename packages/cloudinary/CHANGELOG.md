# CHANGELOG — cloudinary

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 82% → 85%

- **Profile:** `packages/cloudinary/contract.yaml`
- **Functions added:** `remove_all_tags`, `create_archive`, `api.create_folder` (3 total)
- **Postconditions added:** 3 (one per function — same error envelope as the rest of the Upload/Admin API surface)
- **Functions intentionally omitted this pass:** `replace_tag` (tag-clearing variant — same contract as remove_tag, low marginal coverage value), `create_zip` (delegates to create_archive with target_format="zip" — identical error envelope, covered by parent), `api.delete_folder` (mirrors create_folder but with HTTP 404 instead of 409 — narrower CMS adoption signal, deferred to next pass), `api.rename_folder` (low usage signal in active corpus).
- **Scanner concerns queued:** 0 — the generic 3-level call-chain detector already fires on `cloudinary.uploader.remove_all_tags`, `cloudinary.uploader.create_archive`, and `cloudinary.api.create_folder` patterns (verified by 6 new ground-truth tests, all passing).
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://cloudinary.com/documentation/image_upload_api_reference, https://cloudinary.com/documentation/admin_api, https://cloudinary.com/documentation/upload_images (Upload API error envelope confirmed: `{ error: { message } }` with HTTP 400/401/403/404/409/420/500)
- **Source code consulted:** `lib/uploader.js` exports `remove_all_tags`, `create_archive`, `create_zip`; `lib/api.js` exports `create_folder` — all route through `call_api`/`execute_request` so they share the canonical plain-object `{ message, http_code }` rejection shape.
- **Real-world usage observed:** `cloudinary.v2.uploader.remove_all_tags([publicId])` in fictionco/fiction (1466 stars, active corpus repo); broad CMS-onboarding adoption pattern documented for `api.create_folder`.
- **Verified by:** bc-deepen-contract (pass 33 by deepen-stream-2 on 2026-06-24T02:10:12Z)

## 2026-06-18 — re-verified clean

- **Latest published:** cloudinary@2.10.0
- **Profile semver:** `>=1.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** cloudinary@2.10.0
- **Profile semver:** >=1.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** cloudinary@2.10.0
- **Profile semver:** `>=1.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** cloudinary@2.10.0
- **Profile semver:** `>=1.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** cloudinary@2.10.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-15 — backfilled

- **Verified against:** cloudinary@>=1.0.0 <3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
