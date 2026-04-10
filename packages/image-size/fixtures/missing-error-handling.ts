import { imageSize } from 'image-size';
import { imageSizeFromFile } from 'image-size/fromFile';

/**
 * Missing error handling for imageSize (sync).
 * Should trigger ERROR violation — no try-catch.
 */
function getImageDimensionsMissing(buffer: Uint8Array) {
  // ❌ No try-catch — throws on unsupported/corrupt format
  return imageSize(buffer);
}

/**
 * Missing error handling for imageSizeFromFile (async).
 * Should trigger ERROR violation — no try-catch.
 */
async function getImageDimensionsFromFileMissing(filePath: string) {
  // ❌ No try-catch — rejects on file not found or unsupported format
  return await imageSizeFromFile(filePath);
}
