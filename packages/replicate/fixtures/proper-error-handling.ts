/**
 * Proper error handling for replicate.
 * All calls are wrapped in try-catch or have .catch() handlers.
 * Should produce 0 violations.
 */
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// 1. replicate.run() with try-catch
async function generateImageSafe(prompt: string) {
  try {
    const output = await replicate.run("stability-ai/sdxl", {
      input: { prompt }
    });
    return output;
  } catch (error) {
    console.error('Replicate run error:', error);
    throw error;
  }
}

// 2. replicate.run() with .catch() chain
async function generateImageCatch(prompt: string) {
  const output = await replicate.run("stability-ai/sdxl", {
    input: { prompt }
  }).catch((error) => {
    console.error('Replicate error:', error);
    throw error;
  });
  return output;
}

// 3. replicate.predictions.create() with try-catch
async function createPredictionSafe(prompt: string) {
  try {
    const prediction = await replicate.predictions.create({
      version: "9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c",
      input: { prompt },
      webhook: "https://example.com/webhooks/replicate",
      webhook_events_filter: ["completed"],
    });
    return prediction;
  } catch (error) {
    console.error('Replicate prediction error:', error);
    throw error;
  }
}

// 4. replicate.predictions.create() with .catch() chain
async function createPredictionCatch(prompt: string) {
  const prediction = await replicate.predictions.create({
    version: "9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c",
    input: { prompt },
  }).catch((error) => {
    console.error('Prediction error:', error);
    throw error;
  });
  return prediction;
}

// 5. Constructor does NOT throw — no try-catch needed
function createClient() {
  const client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  return client;
}
