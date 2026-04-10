/**
 * Ground-truth fixture for pdf-parse.
 *
 * Annotations placed DIRECTLY before the violating call site.
 *
 * Postcondition IDs:
 *   pdf-func-no-try-catch
 *   get-text-no-try-catch
 *   get-info-no-try-catch
 */

import pdf from 'pdf-parse';
import { PDFParse, PasswordException } from 'pdf-parse';
import fs from 'fs/promises';

// ──────────────────────────────────────────────────
// 1. pdf() functional API — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_pdf_func_missing(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  // SHOULD_FIRE: pdf-func-no-try-catch — pdf() called without try-catch
  const data = await pdf(dataBuffer);
  return data.text;
}

// 1. pdf() functional API — with try-catch (SHOULD_NOT_FIRE)
async function gt_pdf_func_with_try_catch(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  try {
    // SHOULD_NOT_FIRE: pdf() has try-catch
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 2. PDFParse.getText() — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_get_text_missing(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  // SHOULD_FIRE: get-text-no-try-catch — getText() called without try-catch
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

// 2. PDFParse.getText() — with try-catch (SHOULD_NOT_FIRE)
async function gt_get_text_with_try_catch(buffer: Buffer): Promise<string | null> {
  const parser = new PDFParse({ data: buffer });
  try {
    // SHOULD_NOT_FIRE: getText() has try-catch
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    if (error instanceof PasswordException) {
      return null;
    }
    throw error;
  } finally {
    await parser.destroy();
  }
}

// ──────────────────────────────────────────────────
// 3. PDFParse.getInfo() — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_get_info_missing(buffer: Buffer): Promise<number> {
  const parser = new PDFParse({ data: buffer });
  // SHOULD_FIRE: get-info-no-try-catch — getInfo() called without try-catch
  const info = await parser.getInfo();
  await parser.destroy();
  return info.total;
}

// 3. PDFParse.getInfo() — with try-catch (SHOULD_NOT_FIRE)
async function gt_get_info_with_try_catch(buffer: Buffer): Promise<number | null> {
  const parser = new PDFParse({ data: buffer });
  try {
    // SHOULD_NOT_FIRE: getInfo() has try-catch
    const info = await parser.getInfo({ parsePageInfo: true });
    return info.total;
  } catch (error) {
    console.error('Failed to get PDF info:', error);
    return null;
  } finally {
    await parser.destroy();
  }
}
