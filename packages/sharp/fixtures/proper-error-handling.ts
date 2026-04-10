import sharp from 'sharp';

// ✅ Proper: toFile with try-catch
async function resizeImage(inputPath: string, outputPath: string) {
  try {
    await sharp(inputPath)
      .resize(300, 200)
      .toFile(outputPath);
    return { success: true };
  } catch (error) {
    console.error('Failed to resize image:', error);
    throw error;
  }
}

// ✅ Proper: toBuffer with try-catch
async function convertToPng(inputPath: string) {
  try {
    const buffer = await sharp(inputPath)
      .png()
      .toBuffer();
    return buffer;
  } catch (error) {
    console.error('Failed to convert image:', error);
    return null;
  }
}

// ✅ Proper: chained operations with error handling
async function optimizeImage(input: Buffer) {
  try {
    const optimized = await sharp(input)
      .resize(1200, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    return optimized;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error(`Optimization failed: ${error.message}`);
  }
}
