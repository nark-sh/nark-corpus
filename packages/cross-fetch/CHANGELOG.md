# CHANGELOG — cross-fetch

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — deepen pass — coverage 50% → 50% (total count 6→8)

- **Profile:** `packages/cross-fetch/contract.yaml`
- **Functions added:** `response.textConverted` (1 total)
- **Postconditions added:** 2 (`text-converted-missing-encoding-package`, `text-converted-body-consumed-twice`)
- **Functions intentionally omitted this pass:** `response.buffer` (same error profile as text/arrayBuffer — AbortError mid-stream, body-consumed-twice TypeError; Node.js-only non-standard method)
- **Total function count corrected:** 6 → 8 (discovered `response.buffer()` and `response.textConverted()` in node-fetch source code; not in DOM fetch spec and not previously enumerated)
- **Coverage score unchanged at 0.50** (4/8) — score stayed same because both new functions were discovered together: one contracted, one omitted
- **Key finding:** `textConverted()` requires the optional `encoding` npm package. The package is loaded in a try-catch at module init — if absent, no warning at import time; Error is thrown only at the call site. This is an invisible optional-dependency trap.
- **Scanner concerns queued:** 2 (`concern-20260611-cross-fetch-deepen-1`, `concern-20260611-cross-fetch-deepen-2`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `node-fetch/lib/index.js` (installed locally via npm, v2.7.0) — consumeBody() TypeError path and convertBody() encoding Error path
  - `https://raw.githubusercontent.com/node-fetch/node-fetch/2.x/README.md` — textConverted() optional `encoding` dep documentation
  - `https://developer.mozilla.org/en-US/docs/Web/API/Response` — confirmed `bytes()` is NOT in node-fetch v2
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T22:00:00.000000Z)

## 2026-04-17 — backfilled

- **Verified against:** cross-fetch@>=3.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
