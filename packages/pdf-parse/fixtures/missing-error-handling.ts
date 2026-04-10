/**
 * Missing error handling patterns for pdf-parse.
 * Should trigger ERROR violations.
 */

import pdf from 'pdf-parse';
import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';

// ❌ Pattern 1: Functional API without try-catch (matches cline/cline pattern)
async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);  // ❌ No try-catch — throws InvalidPDFException, etc.
  return data.text;
}

// ❌ Pattern 2: Class API getText() without try-catch (matches ItzCrazyKns/Vane pattern)
async function getPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();  // ❌ No try-catch
  await parser.destroy();
  return result.text;
}

// ❌ Pattern 3: getInfo without try-catch
async function getPageCount(buffer: Buffer): Promise<number> {
  const parser = new PDFParse({ data: buffer });
  const info = await parser.getInfo();  // ❌ No try-catch
  await parser.destroy();
  return info.total;
}

// ❌ Pattern 4: .then() chain without .catch()
async function countPages(buffer: Buffer): Promise<number> {
  const parser = new PDFParse({ data: buffer });
  const count = await parser.getInfo().then(info => info.total);  // ❌ No .catch()
  await parser.destroy();
  return count;
}
