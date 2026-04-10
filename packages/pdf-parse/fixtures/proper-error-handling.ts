/**
 * Proper error handling patterns for pdf-parse.
 * Should NOT trigger any violations.
 */

import pdf from 'pdf-parse';
import { PDFParse, PasswordException } from 'pdf-parse';
import fs from 'fs/promises';

// Pattern 1: Functional API with proper try-catch
async function extractTextWithProperHandling(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      console.error('PDF parsing failed:', error.message);
    }
    throw error;
  }
}

// Pattern 2: Class API with try-catch and destroy in finally
async function extractTextClassApi(buffer: Buffer): Promise<string | null> {
  const parser = new PDFParse({ data: buffer });
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

// Pattern 3: getInfo with proper error handling
async function getPdfMetadata(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const info = await parser.getInfo({ parsePageInfo: true });
    return { total: info.total, title: info.infoData?.Title };
  } catch (error) {
    console.error('Failed to get PDF metadata:', error);
    return null;
  } finally {
    await parser.destroy();
  }
}
