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

// ─────────────────────────────────────────────────────────────────────────────
// 3. metadata — read image header info (width, height, format, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export async function getImageDimensionsNoCatch(inputPath: string) {
  // SHOULD_FIRE: metadata-rejects-on-corrupt-or-unsupported-input — metadata() rejects on
  // missing file, corrupt header, or unsupported format. No try-catch.
  const meta = await sharp(inputPath).metadata();
  return { width: meta.width, height: meta.height };
}

export async function getImageDimensionsWithCatch(inputPath: string) {
  try {
    // SHOULD_NOT_FIRE: metadata() inside try-catch satisfies error handling
    const meta = await sharp(inputPath).metadata();
    return { width: meta.width, height: meta.height };
  } catch (err) {
    console.error('Could not read image metadata:', err);
    throw err;
  }
}

export async function validateUploadedImageNoCatch(inputBuffer: Buffer) {
  // SHOULD_FIRE: metadata-rejects-on-corrupt-or-unsupported-input — user-provided buffer
  // may be corrupt or not an image at all. No try-catch.
  const meta = await sharp(inputBuffer).metadata();
  return meta.format;
}

export async function validateUploadedImageWithCatch(inputBuffer: Buffer) {
  try {
    // SHOULD_NOT_FIRE: upload validation inside try-catch
    const meta = await sharp(inputBuffer).metadata();
    return meta.format;
  } catch (err) {
    throw new Error(`Invalid image upload: ${(err as Error).message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. stats — pixel-derived statistics (entropy, sharpness, dominant color)
// ─────────────────────────────────────────────────────────────────────────────

export async function getImageStatsNoCatch(inputPath: string) {
  // SHOULD_FIRE: stats-rejects-on-corrupt-or-unsupported-input — stats() decodes all pixels
  // and rejects on corrupt data, missing file, or unsupported format. No try-catch.
  const s = await sharp(inputPath).stats();
  return s.entropy;
}

export async function getImageStatsWithCatch(inputPath: string) {
  try {
    // SHOULD_NOT_FIRE: stats() inside try-catch satisfies error handling
    const s = await sharp(inputPath).stats();
    return s.entropy;
  } catch (err) {
    console.error('Image stats failed:', err);
    throw err;
  }
}

export async function detectBlurryImageNoCatch(inputBuffer: Buffer) {
  // SHOULD_FIRE: stats-rejects-on-corrupt-or-unsupported-input — blur detection pipeline
  // fails silently if corrupt buffer provided. No try-catch.
  const { sharpness } = await sharp(inputBuffer).stats();
  return sharpness < 10;
}

export async function detectBlurryImageWithCatch(inputBuffer: Buffer) {
  try {
    // SHOULD_NOT_FIRE: blur detection inside try-catch
    const { sharpness } = await sharp(inputBuffer).stats();
    return sharpness < 10;
  } catch (err) {
    console.error('Blur detection failed:', err);
    return null;
  }
}
