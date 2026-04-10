import * as pdfjs from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";

/**
 * Instance usage — destructured import pattern.
 * Should trigger violation where try-catch is missing.
 */
class PdfProcessor {
  /**
   * ❌ Missing try-catch — should trigger ERROR violation
   */
  async extractText(buffer: Uint8Array) {
    const pdf = await getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ");
    }
    return text;
  }

  /**
   * ✅ Proper error handling — should NOT trigger violation
   */
  async extractTextSafe(buffer: Uint8Array) {
    try {
      const pdf = await getDocument({ data: buffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ");
      }
      return text;
    } catch (error) {
      console.error("PDF extraction failed:", error);
      return null;
    }
  }
}
