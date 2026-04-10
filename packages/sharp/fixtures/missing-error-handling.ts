import sharp from 'sharp';

// ❌ Missing: toFile without try-catch
async function resizeImageBad(inputPath: string, outputPath: string) {
  await sharp(inputPath)
    .resize(300, 200)
    .toFile(outputPath);  // No try-catch - will crash on error
  return { success: true };
}

// ❌ Missing: toBuffer without try-catch
async function convertToPngBad(inputPath: string) {
  const buffer = await sharp(inputPath)
    .png()
    .toBuffer();  // No try-catch - will crash on invalid image
  return buffer;
}

// ❌ Missing: chained operations without error handling
async function optimizeImageBad(input: Buffer) {
  const optimized = await sharp(input)
    .resize(1200, 800)
    .jpeg({ quality: 80 })
    .toBuffer();  // No try-catch
  return optimized;
}
