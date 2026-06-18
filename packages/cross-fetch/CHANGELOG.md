# CHANGELOG — cross-fetch

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** cross-fetch@4.1.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** cross-fetch@4.1.0
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** cross-fetch@4.1.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** cross-fetch@4.1.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** cross-fetch@4.1.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 50% → 100% (effective, 4/4 non-omitted)

- **Profile:** `packages/cross-fetch/contract.yaml`
- **Functions added:** none (no new functions discovered)
- **Postconditions added:** 3 — all on existing `fetch()` function:
  - `fetch-request-timeout-error` — node-fetch `{ timeout: N }` init option throws `FetchError` type=`'request-timeout'`
  - `fetch-body-timeout-error` — same `{ timeout }` option arms body-read timer; throws during `.json()`/`.text()`/`.buffer()` with type=`'body-timeout'`
  - `fetch-max-size-error` — node-fetch `{ size: N }` init option throws `FetchError` type=`'max-size'` on oversized body (SSRF/OOM guard)
- **Total function count corrected:** 8 → 7 (`response.formData()` does NOT exist in node-fetch v2; it's a DOM-only method only available in browser native fetch — was previously counted as omitted in error)
- **Coverage score:** 0.50 raw (4/8) → 1.00 effective (4/4 non-omitted). Header comment now reflects corrected total of 7 (3 omitted + 4 contracted).
- **Functions intentionally omitted this pass:** `response.arrayBuffer`, `response.blob`, `response.buffer` — all share the exact consumeBody() error profile of `response.text()` (AbortError mid-stream + TypeError body-disturbed); per-method postconditions would duplicate text-abort-mid-stream and text-body-consumed-twice without adding new error paths.
- **Key finding:** node-fetch's `{ timeout }` and `{ size }` init options are commonly assumed to be cross-environment but are silently ignored by browser native fetch. cross-fetch users on Node.js can pass them and get distinct `FetchError` types (NOT `TypeError`, NOT `AbortError`) that require their own `error.name === 'FetchError' && error.type === '...'` branches in catch blocks. The `timeout` option arms TWO timers from a single value — one for request, one for body read — so try-catch is needed around BOTH `fetch()` AND the body method.
- **Scanner concerns queued:** 3 (`concern-20260612-cross-fetch-deepen-1`, `concern-20260612-cross-fetch-deepen-2`, `concern-20260612-cross-fetch-deepen-3`)
- **Scanner version used:** nark@3.0.0 (per nark-dev/nark/package.json)
- **Sources fetched:**
  - `node_modules/node-fetch/lib/index.js` (v2.7.0, locally installed via cross-fetch@4.1.0) — lines 384-389 (body-timeout), 409-412 (max-size), 1491-1497 (request-timeout)
  - `node_modules/node-fetch/README.md` v2 — `{ timeout, size }` init option documentation
  - `https://github.com/node-fetch/node-fetch/blob/2.x/ERROR-HANDLING.md`
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T02:21:55.953567+00:00)

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
