/**
 * image-size Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions:
 *   - imageSize(input)           postcondition: unsupported-format, corrupt-image
 *   - imageSizeFromFile(path)    postcondition: file-not-found, unsupported-format
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires imageSize/imageSizeFromFile without try-catch
 *
 * Source: extracted from image-size 2.0.2 dist/fromFile.cjs
 * - imageSize() throws TypeError on unsupported/corrupt formats
 * - imageSizeFromFile() rejects on ENOENT and TypeError
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
