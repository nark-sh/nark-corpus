/**
 * Ground-truth fixture for replicate.
 *
 * Annotations placed DIRECTLY before the violating call site.
 *
 * Postcondition IDs:
 *   run-no-error-handling
 *   predictions-create-no-error-handling
 */
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// ──────────────────────────────────────────────────
// 1. run — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_run_missing(prompt: string) {
  // SHOULD_FIRE: run-no-error-handling — run without try-catch
  const output = await replicate.run("stability-ai/sdxl", {
    input: { prompt }
  });
  return output;
}

// 1. run — with try-catch (SHOULD_NOT_FIRE)
async function gt_run_with_try_catch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: run has try-catch
    const output = await replicate.run("stability-ai/sdxl", {
      input: { prompt }
    });
    return output;
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
}

// 1. run — with .catch() (SHOULD_NOT_FIRE)
async function gt_run_with_catch_chain(prompt: string) {
  // SHOULD_NOT_FIRE: run has .catch() handler
  const output = await replicate.run("stability-ai/sdxl", {
    input: { prompt }
  }).catch((error) => {
    console.error('Error:', error);
    throw error;
  });
  return output;
}

// ──────────────────────────────────────────────────
// 2. predictions.create — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_predictions_create_missing(prompt: string) {
  // SHOULD_FIRE: predictions-create-no-error-handling — predictions.create without try-catch
  const prediction = await replicate.predictions.create({
    version: "9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c",
    input: { prompt },
  });
  return prediction;
}

// 2. predictions.create — with try-catch (SHOULD_NOT_FIRE)
async function gt_predictions_create_with_try_catch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: predictions.create has try-catch
    const prediction = await replicate.predictions.create({
      version: "9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c",
      input: { prompt },
    });
    return prediction;
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

// 2. predictions.create — with .catch() (SHOULD_NOT_FIRE)
async function gt_predictions_create_with_catch_chain(prompt: string) {
  // SHOULD_NOT_FIRE: predictions.create has .catch() handler
  const prediction = await replicate.predictions.create({
    version: "9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c",
    input: { prompt },
  }).catch((error) => {
    console.error('Error:', error);
    throw error;
  });
  return prediction;
}
