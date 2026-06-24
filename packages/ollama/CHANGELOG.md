# CHANGELOG — ollama

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (drift-by-staleness re-verify)

- **Profile:** `packages/ollama/contract.yaml`
- **Functions added:** none (re-verification only)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** push (same surface as pull — covered), embeddings (deprecated alias for embed), list (read-only GET /api/tags), ps (read-only GET /api/ps), version (read-only GET /api/version), encodeImage (utility, internally swallows fs errors)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** dist/index.d.ts, dist/shared/ollama.1bfa89da.d.ts, dist/browser.cjs, dist/index.cjs (ollama@0.6.3, installed from npm 2026-06-24)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T05:55:10Z, deepen-stream-2 pass 51)
- **Drift verdict:** ollama@0.6.3 is current latest (matches last_verified pin); API surface unchanged since 2026-04-16; all 16 async-callable methods re-enumerated; all 6 documented omissions re-confirmed valid against source.

## 2026-06-18 — re-verified clean

- **Latest published:** ollama@0.6.3
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ollama@0.6.3
- **Profile semver:** >=0.1.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ollama@0.6.3
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** ollama@0.6.3
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ollama@0.6.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** ollama@>=0.1.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
