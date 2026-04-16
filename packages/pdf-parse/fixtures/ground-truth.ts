/**
 * Ground-truth fixture for pdf-parse.
 *
 * Annotations placed DIRECTLY before the violating call site.
 *
 * Postcondition IDs:
 *   pdf-func-no-try-catch
 *   get-text-no-try-catch
 *   get-info-no-try-catch
 *   get-image-no-try-catch
 *   get-screenshot-no-try-catch
 *   get-table-no-try-catch
 *   get-header-ok-not-checked
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

// ──────────────────────────────────────────────────
// 4. PDFParse.getImage() — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: get-image-no-try-catch
async function gt_get_image_missing(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  // SHOULD_FIRE: get-image-no-try-catch — getImage() called without try-catch
  const images = await parser.getImage({ imageDataUrl: true });
  await parser.destroy();
  return images.pages;
}

// 4. PDFParse.getImage() — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_get_image_with_try_catch(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    // SHOULD_NOT_FIRE: getImage() has try-catch
    const images = await parser.getImage({ imageDataUrl: true });
    return images.pages;
  } catch (error) {
    console.error('Image extraction failed:', error);
    throw error;
  } finally {
    await parser.destroy();
  }
}

// ──────────────────────────────────────────────────
// 5. PDFParse.getScreenshot() — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: get-screenshot-no-try-catch
async function gt_get_screenshot_missing(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  // SHOULD_FIRE: get-screenshot-no-try-catch — getScreenshot() called without try-catch
  const screenshots = await parser.getScreenshot({ scale: 1.5 });
  await parser.destroy();
  return screenshots.pages;
}

// 5. PDFParse.getScreenshot() — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_get_screenshot_with_try_catch(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    // SHOULD_NOT_FIRE: getScreenshot() has try-catch
    const screenshots = await parser.getScreenshot({ scale: 1.5 });
    return screenshots.pages;
  } catch (error) {
    console.error('Screenshot rendering failed:', error);
    throw error;
  } finally {
    await parser.destroy();
  }
}

// ──────────────────────────────────────────────────
// 6. PDFParse.getTable() — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: get-table-no-try-catch
async function gt_get_table_missing(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  // SHOULD_FIRE: get-table-no-try-catch — getTable() called without try-catch
  const tables = await parser.getTable();
  await parser.destroy();
  return tables.pages;
}

// 6. PDFParse.getTable() — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_get_table_with_try_catch(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    // SHOULD_NOT_FIRE: getTable() has try-catch
    const tables = await parser.getTable({ partial: [1, 2, 3] });
    return tables.pages;
  } catch (error) {
    console.error('Table extraction failed:', error);
    throw error;
  } finally {
    await parser.destroy();
  }
}

// ──────────────────────────────────────────────────
// 7. getHeader() — .ok not checked before use (SHOULD_FIRE)
// ──────────────────────────────────────────────────

import { getHeader } from 'pdf-parse/node';

// @expect-violation: get-header-ok-not-checked
async function gt_get_header_no_ok_check(url: string): Promise<boolean | null> {
  // SHOULD_FIRE: get-header-ok-not-checked — result.ok not checked before use
  const result = await getHeader(url, true);
  // Silent failure: if network fails, result.ok is false but we ignore it
  return result.magic;
}

// 7. getHeader() — with .ok check (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_get_header_with_ok_check(url: string): Promise<boolean> {
  const result = await getHeader(url, true);
  // SHOULD_NOT_FIRE: result.ok is checked before accessing result.magic
  if (!result.ok) {
    throw new Error(`PDF URL unreachable: ${result.error?.message ?? 'unknown error'}`);
  }
  return result.magic === true;
}
