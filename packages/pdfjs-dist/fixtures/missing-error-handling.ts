import * as pdfjs from "pdfjs-dist";

/**
 * Missing error handling — should trigger ERROR violation.
 * getDocument().promise can throw InvalidPDFException, PasswordException, etc.
 */
async function parsePdfMissing(buffer: ArrayBuffer) {
  // ❌ No try-catch — corrupted PDF throws InvalidPDFException
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  return content.items.map((item: any) => item.str).join(" ");
}

/**
 * Missing error handling with URL source — should trigger ERROR violation.
 */
async function loadPdfFromUrlMissing(url: string) {
  // ❌ No try-catch — HTTP errors throw ResponseException
  const pdf = await pdfjs.getDocument(url).promise;
  return pdf.numPages;
}
