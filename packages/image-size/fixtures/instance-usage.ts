import { imageSize } from 'image-size';
import { imageSizeFromFile } from 'image-size/fromFile';

class ImageProcessor {
  // ❌ No try-catch — should trigger violation
  processSync(buffer: Uint8Array) {
    return imageSize(buffer);
  }

  // ❌ No try-catch — should trigger violation
  async processAsync(filePath: string) {
    return await imageSizeFromFile(filePath);
  }

  // ✅ Proper error handling
  safeProcesSync(buffer: Uint8Array) {
    try {
      return imageSize(buffer);
    } catch (error) {
      return null;
    }
  }
}
