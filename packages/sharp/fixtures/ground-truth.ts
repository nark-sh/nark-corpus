/**
 * sharp Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "sharp"):
 *   - sharp().toFile()   postcondition: tofile-rejects-on-error
 *   - sharp().toBuffer() postcondition: tobuffer-rejects-on-error
 *
 * Detection pattern:
 *   - sharp is imported from 'sharp'
 *   - sharp() factory call tracked → instance resolved to package
 *   - ThrowingFunctionDetector: .toFile() and .toBuffer() → detected
 *   - ContractMatcher: checks try-catch → fires postconditions
 */

import sharp from 'sharp';

// ─────────────────────────────────────────────────────────────────────────────
// 1. toFile — write processed image to disk
// ─────────────────────────────────────────────────────────────────────────────

export async function resizeImageNoCatch(inputPath: string, outputPath: string) {
  // SHOULD_FIRE: tofile-rejects-on-error — toFile rejects on ENOENT, EACCES, invalid image. No try-catch.
  await sharp(inputPath)
    .resize(300, 200)
    .toFile(outputPath);
}

export async function resizeImageWithCatch(inputPath: string, outputPath: string) {
  try {
    // SHOULD_NOT_FIRE: toFile inside try-catch satisfies error handling
    await sharp(inputPath)
      .resize(300, 200)
      .toFile(outputPath);
  } catch (err) {
    console.error('Image resize failed:', err);
    throw err;
  }
}

export async function convertFormatNoCatch(inputPath: string, outputPath: string) {
  // SHOULD_FIRE: tofile-rejects-on-error — format conversion can fail on corrupt data. No try-catch.
  await sharp(inputPath)
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}

export async function convertFormatWithCatch(inputPath: string, outputPath: string) {
  try {
    // SHOULD_NOT_FIRE: format conversion inside try-catch
    await sharp(inputPath)
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  } catch (err) {
    throw new Error(`Conversion failed: ${(err as Error).message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. toBuffer — return processed image as Buffer
// ─────────────────────────────────────────────────────────────────────────────

export async function processToBufferNoCatch(inputBuffer: Buffer) {
  // SHOULD_FIRE: tobuffer-rejects-on-error — invalid/corrupt input rejects. No try-catch.
  const result = await sharp(inputBuffer)
    .resize(800, 600)
    .png()
    .toBuffer();
  return result;
}

export async function processToBufferWithCatch(inputBuffer: Buffer) {
  try {
    // SHOULD_NOT_FIRE: toBuffer inside try-catch
    const result = await sharp(inputBuffer)
      .resize(800, 600)
      .png()
      .toBuffer();
    return result;
  } catch (err) {
    console.error('Image processing failed:', err);
    return null;
  }
}

export async function thumbnailNoCatch(inputPath: string) {
  // SHOULD_FIRE: tobuffer-rejects-on-error — thumbnail generation fails on bad input. No try-catch.
  const thumbnail = await sharp(inputPath)
    .resize(150, 150, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();
  return thumbnail;
}

export async function thumbnailWithCatch(inputPath: string) {
  try {
    // SHOULD_NOT_FIRE: thumbnail generation inside try-catch
    const thumbnail = await sharp(inputPath)
      .resize(150, 150, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();
    return thumbnail;
  } catch (err) {
    console.error('Thumbnail failed:', err);
    throw err;
  }
}
