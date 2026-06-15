# CHANGELOG — pdfjs-dist

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-15 — deepen pass — coverage 61% → 65%

- **Profile:** `packages/pdfjs-dist/contract.yaml`
- **Functions added:** `doc.getPageIndex`, `doc.getDestination` (2 total)
- **Postconditions added:** 3
  - `getpageindex-invalid-ref-type` — getPageIndex() throws Error("Invalid pageIndex request.") when called with non-RefProxy (before worker call)
  - `getpageindex-page-removed` — getPageIndex() throws Error("GetPageIndex: page has been removed.") when ref points to a deleted page
  - `getdestination-invalid-id-type` — getDestination() returns Promise.reject(Error("Invalid destination request.")) when id is not a string
- **Functions intentionally omitted this pass:** none (same 13 as 2026-06-11 pass)
- **API surface correction:** Prior count of 18 total was understated. getPageIndex and getDestination were not enumerated in either contracted or omitted lists. Revised total: 20 async-callable.
- **Scanner concerns queued:** 3 (`concern-20260615-pdfjs-dist-deepen-1`, `concern-20260615-pdfjs-dist-deepen-2`, `concern-20260615-pdfjs-dist-deepen-3`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `node_modules/pdfjs-dist/build/pdf.mjs` (transport.getPageIndex lines 16506-16518 — isRefProxy validation, pagesMapper lookup)
  - `node_modules/pdfjs-dist/build/pdf.mjs` (transport.getDestination lines 16538-16542 — typeof id !== "string" check)
  - `https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html`
- **Verified by:** bc-deepen-contract (deepen-stream-1, pass on 2026-06-15T01:34:49Z)

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
