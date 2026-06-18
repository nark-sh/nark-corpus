# CHANGELOG — xml2js

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** xml2js@0.6.2
- **Profile semver:** `>=0.5.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** xml2js@0.6.2
- **Profile semver:** >=0.5.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** xml2js@0.6.2
- **Profile semver:** `>=0.5.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** xml2js@0.6.2
- **Profile semver:** `>=0.5.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** xml2js@0.6.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 67% → 100%

- **Profile:** `packages/xml2js/contract.yaml`
- **Functions added:** none (depth refinement only — all 5 async-callable methods already contracted)
- **Postconditions added:** 1 (`parse-promise-validator-throws` on `parseStringPromise`)
- **Functions intentionally omitted this pass:** `Parser.reset` (sync internal-state reset, no error contract); `processors.*` (5 pure sync transform utilities)
- **Scanner concerns queued:** 1 (`concern-20260612-xml2js-deepen-1`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://github.com/Leonidas-from-XIV/node-xml2js#options (validator option docs)
  - https://github.com/Leonidas-from-XIV/node-xml2js/blob/master/lib/parser.js (lines 217-235, try/catch around user-supplied validator)
  - https://github.com/Leonidas-from-XIV/node-xml2js/blob/master/lib/xml2js.js (ValidationError export)
- **API surface verified against:** xml2js@0.6.2 + @types/xml2js@0.4.x
- **Coverage:** 5/5 async-callable contracted (Parser.reset and processors.* correctly omitted); postcondition count 8 → 9
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T17:30:00Z, deepen-stream-2 pass 3)

## 2026-04-17 — backfilled

- **Verified against:** xml2js@>=0.5.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
