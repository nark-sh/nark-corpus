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
 *
 * Coverage:
 *   - Section 1: bare getDocument().promise → SHOULD_FIRE
 *   - Section 2: getDocument().promise inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: destructured import, no catch → SHOULD_FIRE
 *   - Section 4: destructured import, with catch → SHOULD_NOT_FIRE
 *   - Section 5: pdfjs.getDocument without .promise → SHOULD_NOT_FIRE (synchronous call)
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
// 5. Non-contracted patterns
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: synchronous utility, no async operations
function getPdfVersion() {
  return pdfjs.version;
}
