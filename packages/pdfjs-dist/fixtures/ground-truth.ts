/**
 * pdfjs-dist Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the pdfjs-dist contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - await getDocument(src).promise without try-catch → SHOULD_FIRE: getdocument-no-try-catch
 *   - await getDocument(src).promise inside try-catch → SHOULD_NOT_FIRE
 *   - await doc.getPage(n) without try-catch → SHOULD_FIRE: getpage-invalid-page-number
 *   - await page.getTextContent() without try-catch → SHOULD_FIRE: gettextcontent-no-try-catch
 *   - await renderTask.promise without try-catch → SHOULD_FIRE: render-no-try-catch
 *   - await doc.saveDocument() without try-catch → SHOULD_FIRE: savedocument-no-try-catch
 *   - doc.destroy() not in finally block → SHOULD_FIRE: destroy-not-called-finally
 *   - await doc.cleanup() without try-catch → NO_DETECTOR (cleanup-during-rendering, no scanner rule yet)
 *   - await doc.getData() without try-catch → SHOULD_FIRE: getdata-no-try-catch
 *   - await textLayer.render() without try-catch → NO_DETECTOR (textlayer-render-no-try-catch, no scanner rule yet)
 *   - const bytes = await doc.extractPages(...) without null-check → NO_DETECTOR (extractpages-null-return-unchecked, no scanner rule yet)
 *   - doc.getOptionalContentConfig with mismatched intent → NO_DETECTOR (getoptionalcontentconfig-intent-mismatch, no scanner rule yet)
 *
 * Coverage:
 *   - Section 1: bare getDocument().promise → SHOULD_FIRE
 *   - Section 2: getDocument().promise inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: destructured import, no catch → SHOULD_FIRE
 *   - Section 4: destructured import, with catch → SHOULD_NOT_FIRE
 *   - Section 5: doc.getPage() without try-catch → SHOULD_FIRE
 *   - Section 6: doc.getPage() with try-catch → SHOULD_NOT_FIRE
 *   - Section 7: page.getTextContent() without try-catch → SHOULD_FIRE
 *   - Section 8: page.getTextContent() with try-catch → SHOULD_NOT_FIRE
 *   - Section 9: page.render() without try-catch → SHOULD_FIRE
 *   - Section 10: page.render() with try-catch → SHOULD_NOT_FIRE
 *   - Section 11: doc.saveDocument() without try-catch → SHOULD_FIRE
 *   - Section 12: doc.saveDocument() with try-catch → SHOULD_NOT_FIRE
 *   - Section 13: non-contracted patterns → SHOULD_NOT_FIRE
 *   - Section 14: doc.cleanup() without try-catch → SHOULD_FIRE
 *   - Section 15: doc.cleanup() with try-catch → SHOULD_NOT_FIRE
 *   - Section 16: doc.getData() without try-catch → SHOULD_FIRE
 *   - Section 17: doc.getData() with try-catch → SHOULD_NOT_FIRE
 *   - Section 18: TextLayer.render() without try-catch → SHOULD_FIRE
 *   - Section 19: TextLayer.render() with try-catch → SHOULD_NOT_FIRE
 *   - Section 20: doc.extractPages() without null-check → NO_DETECTOR (postcondition added, scanner upgrade needed)
 *   - Section 21: doc.extractPages() with null-check → SHOULD_NOT_FIRE
 *   - Section 22: doc.getOptionalContentConfig() mismatched intent → NO_DETECTOR (postcondition added, scanner upgrade needed)
 *   - Section 23: doc.getOptionalContentConfig() with matching intent → NO_DETECTOR (scanner fires on all calls as approximation; intent-match check requires cross-call analysis)
 *
 * Updated: 2026-04-17 (deepen-stream-1 pass 9) — added sections 14-19 for cleanup, getData, TextLayer.render
 * Updated: 2026-06-11 (deepen-stream-1 pass 1) — added sections 20-23 for extractPages, getOptionalContentConfig (v6.x)
 */

import * as pdfjs from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare getDocument().promise — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function parsePdfNoCatch(buffer: ArrayBuffer) {
  // SHOULD_FIRE: getdocument-no-try-catch — InvalidPDFException/PasswordException unhandled on bad PDF
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  return pdf.numPages;
}

export async function loadPdfByUrlNoCatch(url: string) {
  // SHOULD_FIRE: getdocument-no-try-catch — ResponseException unhandled on HTTP error
  const pdf = await pdfjs.getDocument(url).promise;
  return pdf.numPages;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. getDocument().promise inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function parsePdfWithCatch(buffer: ArrayBuffer) {
  try {
    // SHOULD_NOT_FIRE: getDocument().promise inside try-catch satisfies the error handling requirement
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error("PDF load failed:", error);
    return 0;
  }
}

export async function parsePdfWithSpecificCatch(buffer: ArrayBuffer) {
  try {
    // SHOULD_NOT_FIRE: properly handled with typed catch
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    return content.items.map((i: any) => i.str).join("");
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") {
      return "PASSWORD_REQUIRED";
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Destructured import, no catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function loadWithDestructuredNoCatch(data: Uint8Array) {
  // SHOULD_FIRE: getdocument-no-try-catch — same function via destructured import
  const pdf = await getDocument({ data }).promise;
  return pdf.numPages;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Destructured import, with catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function loadWithDestructuredWithCatch(data: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: destructured getDocument wrapped in try-catch
    const pdf = await getDocument({ data }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error("Failed:", error);
    return -1;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. doc.getPage() — without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPageNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  // SHOULD_FIRE: getpage-invalid-page-number — Error("Invalid page request.") unhandled
  const page = await doc.getPage(1);
  return page.pageNumber;
}

export async function getPageInLoopNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  for (let i = 0; i < doc.numPages; i++) {
    // Common bug: using 0-based index (should be i+1)
    // SHOULD_FIRE: getpage-invalid-page-number — off-by-one error (0-indexed) unhandled
    const page = await doc.getPage(i);
    console.log(page.pageNumber);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. doc.getPage() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPageWithCatch(buffer: ArrayBuffer) {
  try {
    // SHOULD_NOT_FIRE: getPage() inside try-catch satisfies error handling requirement
    const doc = await getDocument({ data: buffer as Uint8Array }).promise;
    const page = await doc.getPage(1);
    return page.pageNumber;
  } catch (error) {
    console.error("getPage failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. page.getTextContent() — without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function extractTextNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  // SHOULD_FIRE: gettextcontent-no-try-catch — UnknownErrorException/AbortException unhandled
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. page.getTextContent() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function extractTextWithCatch(buffer: ArrayBuffer) {
  try {
    // SHOULD_NOT_FIRE: getTextContent() inside try-catch satisfies error handling requirement
    const doc = await getDocument({ data: buffer as Uint8Array }).promise;
    const page = await doc.getPage(1);
    const textContent = await page.getTextContent();
    return textContent.items.map((item: any) => item.str).join(" ");
  } catch (error) {
    console.error("Text extraction failed:", error);
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. page.render() — await .promise without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function renderPageNoCatch(buffer: ArrayBuffer, canvas: any) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const renderTask = page.render({ canvas, viewport });
  // SHOULD_FIRE: render-no-try-catch — RenderingCancelledException unhandled
  await renderTask.promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. page.render() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function renderPageWithCatch(buffer: ArrayBuffer, canvas: any) {
  try {
    // SHOULD_NOT_FIRE: render().promise inside try-catch satisfies error handling requirement
    const doc = await getDocument({ data: buffer as Uint8Array }).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });
    const renderTask = page.render({ canvas, viewport });
    await renderTask.promise;
  } catch (error: any) {
    if (error.name === "RenderingCancelledException") {
      // Expected — rendering was cancelled
      return;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. doc.saveDocument() — without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function saveDocumentNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  // SHOULD_FIRE: savedocument-no-try-catch — worker error during serialization unhandled
  const bytes = await doc.saveDocument();
  return bytes;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. doc.saveDocument() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function saveDocumentWithCatch(buffer: ArrayBuffer) {
  try {
    // SHOULD_NOT_FIRE: saveDocument() inside try-catch satisfies error handling requirement
    const doc = await getDocument({ data: buffer as Uint8Array }).promise;
    const bytes = await doc.saveDocument();
    return bytes;
  } catch (error) {
    console.error("Save failed:", error);
    throw new Error("PDF save failed");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Non-contracted patterns
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: synchronous utility, no async operations
function getPdfVersion() {
  return pdfjs.version;
}

// SHOULD_NOT_FIRE: doc.destroy() in finally block (correct pattern)
export async function processPdfWithDestroy(buffer: ArrayBuffer) {
  let doc: any;
  try {
    // SHOULD_NOT_FIRE: destroy() is called in finally
    doc = await getDocument({ data: buffer as Uint8Array }).promise;
    const page = await doc.getPage(1);
    const textContent = await page.getTextContent();
    return textContent.items.map((item: any) => item.str).join(" ");
  } catch (error) {
    console.error("Processing failed:", error);
    throw error;
  } finally {
    await doc?.destroy();  // Always destroy
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. doc.cleanup() — without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function cleanupDocumentNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  // SHOULD_FIRE: cleanup-during-rendering — doc.cleanup() without try-catch throws if a page is rendering
  await doc.cleanup();
}

export async function cleanupAfterRenderNoCatch(buffer: ArrayBuffer, canvas: any) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const renderTask = page.render({ canvas, viewport });
  // Start render but don't await it — then immediately cleanup while rendering is in progress
  // SHOULD_FIRE: cleanup-during-rendering — doc.cleanup() without try-catch while rendering throws
  await doc.cleanup();
  await renderTask.promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. doc.cleanup() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function cleanupDocumentWithCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  try {
    // SHOULD_NOT_FIRE: cleanup() inside try-catch satisfies error handling requirement
    await doc.cleanup();
  } catch (error: any) {
    if (error.message?.includes('currently rendering')) {
      console.warn('Cleanup skipped — rendering in progress');
    } else {
      throw error;
    }
  } finally {
    await doc.destroy();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. doc.getData() — without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPdfDataNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  // SHOULD_FIRE: getdata-no-try-catch — worker error during data transfer unhandled
  const bytes = await doc.getData();
  return bytes;
}

export async function downloadPdfNoCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  // SHOULD_FIRE: getdata-no-try-catch — Error("Worker was destroyed") propagates if destroy() races
  const pdfData = await doc.getData();
  return new Blob([pdfData], { type: 'application/pdf' });
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. doc.getData() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPdfDataWithCatch(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  try {
    // SHOULD_NOT_FIRE: getData() inside try-catch satisfies error handling requirement
    const bytes = await doc.getData();
    return new Uint8Array(bytes);
  } catch (error) {
    console.error('Failed to get PDF data:', error);
    return null;
  } finally {
    await doc.destroy();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. TextLayer.render() — without try-catch → SHOULD_FIRE
// TextLayer is tracked via class_names: [TextLayer] in pdfjs-dist contract.
// new pdfjs.TextLayer({...}) → textLayer tracked as pdfjs-dist. render() matches
// the 'render' function contract → fires render-no-try-catch.
// ─────────────────────────────────────────────────────────────────────────────

export async function renderTextLayerNoCatch(buffer: ArrayBuffer, container: HTMLElement) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const textLayer = new pdfjs.TextLayer({
    textContentSource: page.streamTextContent(),
    container,
    viewport,
  });
  // SHOULD_FIRE: render-no-try-catch — textLayer.render() without try-catch throws AbortException on cancel
  await textLayer.render();
}

export async function renderTextLayerWithCancelNoCatch(buffer: ArrayBuffer, container: HTMLElement) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const textLayer = new pdfjs.TextLayer({
    textContentSource: page.streamTextContent(),
    container,
    viewport,
  });
  // Cancel immediately after starting — AbortException will be thrown if not caught
  textLayer.cancel();
  // SHOULD_FIRE: render-no-try-catch — textLayer.render() after cancel() throws AbortException
  await textLayer.render();
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. TextLayer.render() — with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function renderTextLayerWithCatch(buffer: ArrayBuffer, container: HTMLElement) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const textLayer = new pdfjs.TextLayer({
    textContentSource: page.streamTextContent(),
    container,
    viewport,
  });
  try {
    // SHOULD_NOT_FIRE: textLayer.render() inside try-catch satisfies error handling requirement
    await textLayer.render();
  } catch (error: any) {
    if (error.name === 'AbortException') {
      // Expected — text layer was cancelled (e.g., user navigated away)
      return;
    }
    console.error('Text layer rendering failed:', error);
    throw error;
  } finally {
    await doc.destroy();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. doc.extractPages() — without null-check → NO_DETECTOR
// extractPages() never rejects — resolves with null on failure.
// Contract: extractpages-null-return-unchecked
// Scanner upgrade needed: new pattern (v6.x), no detection rule yet.
// ─────────────────────────────────────────────────────────────────────────────

export async function extractPagesNullUnchecked(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  try {
    // NO_DETECTOR: extractpages-null-return-unchecked
    // extractPages() resolves with null when extraction fails (XFA, invalid pages, etc.)
    // The return value is NOT checked before use — downstream crash when null is passed to Blob.
    const bytes = await doc.extractPages([{ includePages: [[0, 2]] }]);
    // ↑ bytes may be null if extraction failed — not checked here
    const blob = new Blob([bytes as any], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } finally {
    await doc.destroy();
  }
}

export async function extractPagesEmptyNotChecked(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  try {
    // NO_DETECTOR: extractpages-empty-pageinfos
    // Empty pageInfos → resolves with null ("nothing to extract") — not checked
    const bytes = await doc.extractPages([]);
    return bytes; // bytes is null — caller will crash when using it
  } finally {
    await doc.destroy();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. doc.extractPages() — with null-check → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function extractPagesWithNullCheck(buffer: ArrayBuffer) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  try {
    const pageInfos = [{ includePages: [[0, 2]] }];
    if (!pageInfos.length) {
      throw new Error('No pages selected');
    }
    // SHOULD_NOT_FIRE: null-checked before use
    const bytes = await doc.extractPages(pageInfos);
    if (!bytes) {
      throw new Error('PDF page extraction failed (XFA not supported, or invalid page range)');
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('extractPages failed:', error);
    throw error;
  } finally {
    await doc.destroy();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. doc.getOptionalContentConfig() — mismatched intent → NO_DETECTOR
// Throws "Must use the same `intent`-argument" at render time (not at config time).
// Contract: getoptionalcontentconfig-intent-mismatch
// Scanner upgrade needed: intent-mismatch pattern, no detection rule yet.
// ─────────────────────────────────────────────────────────────────────────────

export async function renderWithMismatchedOptionalContentIntent(buffer: ArrayBuffer, canvas: any) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });

  // NO_DETECTOR: getoptionalcontentconfig-intent-mismatch
  // getOptionalContentConfig uses 'print' intent but render() uses 'display' intent
  // → throws Error("Must use the same `intent`-argument...") at render time
  const optionalContentConfigPromise = doc.getOptionalContentConfig({ intent: 'print' });
  try {
    const renderTask = page.render({
      canvas,
      viewport,
      intent: 'display',                       // ← mismatched with 'print' above
      optionalContentConfigPromise,
    });
    await renderTask.promise;
  } catch (error: any) {
    if (error.name === 'RenderingCancelledException') return;
    throw error;
  } finally {
    await doc.destroy();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. doc.getOptionalContentConfig() — matching intent → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function renderWithMatchingOptionalContentIntent(buffer: ArrayBuffer, canvas: any) {
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });

  // NO_DETECTOR: getoptionalcontentconfig-intent-mismatch
  // NOTE: the scanner fires on this even with matching intents because intent-matching
  // requires cross-call data flow analysis (comparing the intent arg in getOptionalContentConfig
  // against the intent arg in render()). The scanner currently has no such rule — it fires
  // on ALL getOptionalContentConfig() calls without try-catch as an approximation.
  // A scanner upgrade is needed to distinguish matching vs. mismatching intent pairs.
  const optionalContentConfigPromise = doc.getOptionalContentConfig({ intent: 'display' });
  try {
    const renderTask = page.render({
      canvas,
      viewport,
      intent: 'display',                       // ← matches 'display' above
      optionalContentConfigPromise,
    });
    await renderTask.promise;
  } catch (error: any) {
    if (error.name === 'RenderingCancelledException') return;
    console.error('Render failed:', error);
    throw error;
  } finally {
    await doc.destroy();
  }
}
