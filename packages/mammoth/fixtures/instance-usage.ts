import mammoth from "mammoth";

/**
 * Instance-style usage pattern — mammoth is used via a class wrapper.
 * Tests that violation detection works when mammoth is called indirectly.
 */
class DocumentConverter {
  async convertToHtml(buffer: Buffer): Promise<string> {
    // ❌ No try-catch — should trigger violation
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  }

  async extractText(buffer: Buffer): Promise<string> {
    // ❌ No try-catch — should trigger violation
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  async safeConvert(buffer: Buffer): Promise<string | null> {
    // ✅ Proper error handling
    try {
      const result = await mammoth.convertToHtml({ buffer });
      return result.value;
    } catch (error) {
      console.error("Conversion failed:", error);
      return null;
    }
  }
}
