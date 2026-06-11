# CHANGELOG — uuid

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — semver range extended

- **Latest published:** uuid@14.0.0
- **Profile semver:** `>=9.0.0 <14.0.0` → `>=9.0.0 <15.0.0`
- **Verdict:** no error-handling-relevant changes for common usage — v14 adds RangeError for invalid buffer offset in v3/v5/v6 (security fix for callers passing explicit buffers with bad offsets); v12 dropped CJS; default string API (uuid.v4() etc.) completely unchanged
- **Changelog evidence:** v14.0.0: "v3/v5/v6 now throw RangeError if offset < 0 or offset + 16 > buf.length"; v12.0.0: "Removed CommonJS support (ESM only)" — the buffer-offset RangeError only affects callers using the explicit buffer API, which the profile does not cover
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-17 — backfilled

- **Verified against:** uuid@>=9.0.0 <14.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
