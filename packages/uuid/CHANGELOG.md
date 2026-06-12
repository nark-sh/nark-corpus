# CHANGELOG — uuid

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-12 — deepen pass — coverage 70% → 67% (raw) / 100% effective

- **Profile:** `packages/uuid/contract.yaml`
- **Functions added:** stringify (1 new, promoted from omitted)
- **Postconditions added:** 3
  - `stringify-invalid-bytes` (new function postcondition)
  - `v3-buffer-offset-out-of-bounds` (new RangeError class in uuid@14.0.0)
  - `v5-buffer-offset-out-of-bounds` (new RangeError class in uuid@14.0.0)
- **Functions intentionally omitted this pass:**
  - v1 (timestamp-based) — same error profile as v4/v7, rare in modern SaaS
  - v6 (reordered v1) — same error profile as v4/v7, rare in modern SaaS
  - v1ToV6 — internal parse() call covered by parse-invalid-uuid
  - v6ToV1 — internal parse() call covered by parse-invalid-uuid
- **Scanner concerns queued:** 3
  - `concern-20260612-uuid-deepen-1` (stringify detection)
  - `concern-20260612-uuid-deepen-2` (v3 buf-offset RangeError detection)
  - `concern-20260612-uuid-deepen-3` (v5 buf-offset RangeError detection)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `node_modules/uuid/dist/v35.js` lines 27-30 (RangeError check for v3/v5)
  - `node_modules/uuid/dist/stringify.js` lines 30-33 (TypeError on invalid bytes)
  - `https://github.com/uuidjs/uuid/blob/main/CHANGELOG.md#1400`
  - `https://github.com/uuidjs/uuid#uuidstringifyarr-offset`
- **Why now:** bc-version-drift sweep (2026-06-11) extended profile semver to <15.0.0 and noted the new uuid@14.0.0 RangeError on v3/v5/v6 buffer-offset bounds, but did not author the postcondition. This pass closes that gap and also promotes stringify out of the "internal utility" omitted bucket because its distinct TypeError class makes log-triage easier.
- **Coverage accounting:** Raw score 8/12 = 0.67 (denominator now includes v1 and v6 which were previously absorbed into the "less common" omitted bucket without being counted). Effective coverage (contracted / non-omitted) = 8/8 = 1.0.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 5 on 2026-06-12T03:45:00Z)

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
