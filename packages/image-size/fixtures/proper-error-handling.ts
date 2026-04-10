import { imageSize } from 'image-size';
import { imageSizeFromFile } from 'image-size/fromFile';

/**
 * Proper error handling for imageSize (sync).
 * Should NOT trigger violations.
 */
function getImageDimensionsSafe(buffer: Uint8Array) {
  try {
    return imageSize(buffer);
  } catch (error) {
    console.error("Unsupported image format:", error);
    return null;
  }
}

/**
 * Proper error handling for imageSizeFromFile (async).
 * Should NOT trigger violations.
 */
async function getImageDimensionsFromFileSafe(filePath: string) {
  try {
    return await imageSizeFromFile(filePath);
  } catch (error) {
    console.error("Failed to read image:", error);
    return null;
  }
}
