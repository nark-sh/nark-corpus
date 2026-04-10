import * as pdfjs from "pdfjs-dist";

/**
 * Proper error handling — should produce 0 violations.
 * Wraps getDocument().promise in try-catch.
 */
async function parsePdfProper(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    return content.items.map((item: any) => item.str).join(" ");
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") {
      throw new Error("PDF is password protected");
    }
    if (error instanceof Error && error.name === "InvalidPDFException") {
      throw new Error("Invalid or corrupted PDF file");
    }
    throw error;
  }
}

/**
 * Proper error handling with URL source — should produce 0 violations.
 */
async function loadPdfFromUrlProper(url: string): Promise<number> {
  try {
    const pdf = await pdfjs.getDocument(url).promise;
    return pdf.numPages;
  } catch (error) {
    console.error("Failed to load PDF:", error);
    throw error;
  }
}
