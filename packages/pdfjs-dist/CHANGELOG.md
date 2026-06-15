# CHANGELOG — pdfjs-dist

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-14 — re-verified clean

- **Latest published:** pdfjs-dist@6.0.227
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — deepen pass — coverage 56% → 61%

- **Profile:** `packages/pdfjs-dist/contract.yaml`
- **Functions added:** `doc.extractPages`, `doc.getOptionalContentConfig` (2 total)
- **Postconditions added:** 3 (extractpages-null-return-unchecked, extractpages-empty-pageinfos, getoptionalcontentconfig-intent-mismatch)
- **Functions intentionally omitted this pass:** `doc.getStructTree` (accessibility tree, read-only), `doc.getMarkInfo` (read-only), `doc.getAnnotationsByType` (read-only), `doc.hasJSActions` (boolean, read-only), `doc.getCalculationOrderIds` (read-only), `doc.getDownloadInfo` (metadata, read-only) — all v6.x additions with no unique behavioral contracts beyond generic worker-destroyed errors
- **Scanner concerns queued:** 3 (`concern-20260611-pdfjs-dist-deepen-1`, `concern-20260611-pdfjs-dist-deepen-2`, `concern-20260611-pdfjs-dist-deepen-3`)
- **API surface change:** 16 → 18 total async-callable functions (v6.x added 8 new methods; 6 omitted, 2 contracted)
- **Scanner version used:** nark@1.0.x (see nark-dev/nark/package.json)
- **Sources fetched:** `https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html`, `https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html`, `build/pdf.worker.mjs ExtractPages handler lines 63522-63616`, `build/pdf.mjs render() intent check line 15594`
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T22:30:00Z)

## 2026-04-17 — backfilled

- **Verified against:** pdfjs-dist@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
