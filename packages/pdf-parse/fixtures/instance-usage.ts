/**
 * Instance-based usage patterns for pdf-parse.
 * Tests detection when PDFParse is used through a class instance.
 */

import { PDFParse, PasswordException } from 'pdf-parse';

class DocumentProcessor {
  private buffer: Buffer;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  // ❌ Missing error handling — instance method call without try-catch
  async extractText(): Promise<string> {
    const parser = new PDFParse({ data: this.buffer });
    const result = await parser.getText();  // ❌ No try-catch
    await parser.destroy();
    return result.text;
  }

  // ✅ Proper error handling — instance method with try-catch
  async extractTextSafe(): Promise<string | null> {
    const parser = new PDFParse({ data: this.buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } catch (error) {
      if (error instanceof PasswordException) {
        console.error('PDF is password-protected');
        return null;
      }
      throw error;
    } finally {
      await parser.destroy();
    }
  }
}
