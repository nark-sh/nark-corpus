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
 *
 * Updated: 2026-04-17 (deepen-stream-2 pass 5) — added sections 5-13 for new functions
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
  // SHOULD_FIRE: getpage-invalid-page-number — Error("Invalid page request.") unhandled
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  return page.pageNumber;
}

export async function getPageInLoopNoCatch(buffer: ArrayBuffer) {
  // SHOULD_FIRE: getpage-invalid-page-number — off-by-one error (0-indexed) unhandled
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  for (let i = 0; i < doc.numPages; i++) {
    // Common bug: using 0-based index (should be i+1)
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
  // SHOULD_FIRE: gettextcontent-no-try-catch — UnknownErrorException/AbortException unhandled
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
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
  // SHOULD_FIRE: render-no-try-catch — RenderingCancelledException unhandled
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const renderTask = page.render({ canvas, viewport });
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
  // SHOULD_FIRE: savedocument-no-try-catch — worker error during serialization unhandled
  const doc = await getDocument({ data: buffer as Uint8Array }).promise;
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
