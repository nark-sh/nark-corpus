/**
 * Missing error handling for replicate.
 * All calls are missing try-catch or .catch() handlers.
 * Should produce ERROR violations.
 */
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// 1. replicate.run() missing try-catch — should fire: run-no-error-handling
async function generateImageMissing(prompt: string) {
  const output = await replicate.run("stability-ai/sdxl", {
    input: { prompt }
  });
  return output;
}

// 2. replicate.run() in a function — should fire: run-no-error-handling
async function runModelNoHandler(model: string, inputs: Record<string, unknown>) {
  const result = await replicate.run(model as `${string}/${string}`, {
    input: inputs
  });
  return result;
}

// 3. replicate.predictions.create() missing try-catch — should fire: predictions-create-no-error-handling
async function createPredictionMissing(prompt: string) {
  const prediction = await replicate.predictions.create({
    version: "9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c",
    input: { prompt },
    webhook: "https://example.com/webhooks/replicate",
    webhook_events_filter: ["completed"],
  });
  return prediction;
}

// 4. replicate.predictions.create() inside a class — should fire: predictions-create-no-error-handling
class PredictionService {
  private client: Replicate;

  constructor() {
    this.client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  }

  async create(version: string, inputs: Record<string, unknown>) {
    const prediction = await this.client.predictions.create({
      version,
      input: inputs,
    });
    return prediction;
  }
}
