/**
 * image-size Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions:
 *   - imageSize(input)           postcondition: unsupported-format, corrupt-image
 *   - imageSizeFromFile(path)    postcondition: file-not-found, unsupported-format,
 *                                               empty-file, corrupt-image-async
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires imageSize/imageSizeFromFile without try-catch
 *
 * Source: extracted from image-size 2.0.2 dist/fromFile.cjs
 * - imageSize() throws TypeError on unsupported/corrupt formats
 * - imageSizeFromFile() rejects on ENOENT, TypeError, and Error("Empty file")
 * - Empty file: throws Error("Empty file") when size <= 0 — distinct from ENOENT
 * - Corrupt file: rejects with TypeError from underlying imageSize() call
 *
 * Updated: 2026-04-17 (deepen-stream-2 pass 3) — added empty-file and corrupt-image-async cases
 */

import { imageSize } from 'image-size';
import { imageSizeFromFile } from 'image-size/fromFile';

// ─────────────────────────────────────────────────────────────────────────────
// 1. imageSize (synchronous) — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function getImageDimensionsNoCatch(buffer: Uint8Array) {
  // SHOULD_FIRE: unsupported-format — imageSize() without try-catch throws TypeError on unsupported format
  return imageSize(buffer);
}

export function getImageDimensionsWithCatch(buffer: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: imageSize() inside try-catch satisfies error handling
    return imageSize(buffer);
  } catch (error) {
    console.error("Failed to get image dimensions:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. imageSizeFromFile (async) — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getImageDimensionsFromFileNoCatch(filePath: string) {
  // SHOULD_FIRE: file-not-found — imageSizeFromFile() without try-catch throws ENOENT if file not found
  return await imageSizeFromFile(filePath);
}

export async function getImageDimensionsFromFileWithCatch(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: imageSizeFromFile() inside try-catch satisfies error handling
    return await imageSizeFromFile(filePath);
  } catch (error) {
    console.error("Failed to get image dimensions from file:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. imageSizeFromFile — empty-file postcondition
//    File exists at path but has zero bytes. Throws Error("Empty file").
//    Common in upload pipelines where file creation races with data writing.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: empty-file
// @expect-violation: file-not-found
export async function processUploadedImageNoCatch(uploadedPath: string) {
  // SHOULD_FIRE: empty-file — imageSizeFromFile() without try-catch throws Error('Empty file') when the file exists but contains zero bytes (common in upload pipelines that check only file existence before data is fully written)
  const dimensions = await imageSizeFromFile(uploadedPath);
  return { width: dimensions.width, height: dimensions.height };
}

// @expect-clean
export async function processUploadedImageWithCatch(uploadedPath: string) {
  try {
    // SHOULD_NOT_FIRE: imageSizeFromFile() inside try-catch catches empty-file error
    const dimensions = await imageSizeFromFile(uploadedPath);
    return { width: dimensions.width, height: dimensions.height };
  } catch (error) {
    if (error instanceof Error && error.message === 'Empty file') {
      throw new Error(`Uploaded file is empty: ${uploadedPath}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. imageSizeFromFile — corrupt-image-async postcondition
//    File exists and is readable, but contains malformed image data.
//    imageSizeFromFile delegates to imageSize(buffer) which throws TypeError.
//    The async wrapper re-rejects with the same TypeError.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: corrupt-image-async
// @expect-violation: file-not-found
export async function getCorruptImageDimensionsNoCatch(filePath: string) {
  // SHOULD_FIRE: corrupt-image-async — imageSizeFromFile() without try-catch rejects with TypeError when file exists but contains corrupt data (e.g. truncated JPG, invalid PNG header); callers that only handle ENOENT will miss corruption errors from user-uploaded files
  return await imageSizeFromFile(filePath);
}

// @expect-clean
export async function getCorruptImageDimensionsWithCatch(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: imageSizeFromFile() inside try-catch catches corrupt-image-async rejection
    return await imageSizeFromFile(filePath);
  } catch (error) {
    if (error instanceof TypeError) {
      // Handles corrupt/unsupported format errors from the imageSize() parser
      throw new Error(`Failed to parse image dimensions: ${error.message}`);
    }
    // Re-throw ENOENT / EACCES / empty-file errors
    throw error;
  }
}
