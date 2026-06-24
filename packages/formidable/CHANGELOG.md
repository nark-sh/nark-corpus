# CHANGELOG — formidable

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (completeness fill)

- **Profile:** `packages/formidable/contract.yaml`
- **Functions added:** 0 (parse() remains the sole async surface)
- **Postconditions added:** 1
  - `formidable-uninitialized-parser` — FormidableError code 1004 (defensive guard inside write(); surfaces via parse() promise rejection when _parser was never bound)
- **Functions intentionally omitted this pass:** unchanged from 2026-06-18 (use/pause/resume/write/onPart sync; writeHeaders internal — its rejections flow through parse())
- **Scanner concerns queued:** 1 (`concern-20260624-formidable-deepen-1`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/node-formidable/formidable/blob/master/src/FormidableError.js (uninitializedParser = 1004 const confirmed at L7)
  - https://github.com/node-formidable/formidable/blob/master/src/Formidable.js#L289-L295 (throw site inside write() with _error() routing to parse() promise rejection)
  - npm pack formidable@3.5.4 inspection at /private/tmp/claude/_pass85/package/src/
- **Notes:** Closes the last documented FormidableError code (1004) without a dedicated postcondition. All 19 numeric constants in FormidableError.js now have either a dedicated postcondition (15) or a documented sync-omission rationale (4: missingPlugin/pluginFunction sync constructor/use() throws, plus aborted/noParser shadowing). Coverage score remains 1.0; this is a completeness fill not a coverage promotion.
- **Verified by:** bc-deepen-contract (pass 85 on 2026-06-24T14:14:06Z)

## 2026-06-18 — deepen pass — coverage 92% → 100%

- **Profile:** `packages/formidable/contract.yaml`
- **Functions added:** 0 (parse() was already the sole async surface)
- **Postconditions added:** 4
  - `formidable-plugin-failed` — FormidableError code 1017 (custom plugin throws during parse())
  - `formidable-smaller-than-min-file-size` — code 1008 (uploaded file under options.minFileSize)
  - `formidable-unknown-transfer-encoding` — code 1014 (exotic multipart Content-Transfer-Encoding)
  - `formidable-filename-not-string` — code 1005 (Content-Disposition header type-confusion / injection)
- **Functions intentionally omitted this pass:** use/pause/resume/write/onPart (synchronous EventEmitter or config methods), writeHeaders (internal — its rejection flows through parse())
- **Scanner concerns queued:** 2 (`concern-20260618-formidable-deepen-1`, `concern-20260618-formidable-deepen-2`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://github.com/node-formidable/formidable/blob/master/src/FormidableError.js (all 20 error code constants)
  - https://github.com/node-formidable/formidable/blob/master/src/Formidable.js (parse(), use(), writeHeaders() source confirming throw sites at lines 142, 274, 292, 313, 415, 471)
  - https://github.com/node-formidable/formidable/blob/master/src/plugins/multipart.js (unknownTransferEncoding throw at line 154)
  - https://github.com/node-formidable/formidable/blob/master/README.md (parse() and use() canonical usage)
- **Verified by:** bc-deepen-contract (pass on 2026-06-19T00:25:51Z)

## 2026-06-18 — re-verified clean

- **Latest published:** formidable@3.5.4
- **Profile semver:** `>=3.5.3` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** formidable@3.5.4
- **Profile semver:** >=3.5.3 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** formidable@3.5.4
- **Profile semver:** `>=3.5.3` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** formidable@3.5.4
- **Profile semver:** `>=3.5.3` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** formidable@3.5.4
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** formidable@>=3.5.3
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
