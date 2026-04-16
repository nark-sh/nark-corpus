/**
 * Ground-truth fixture for replicate.
 *
 * Annotations placed DIRECTLY before the violating call site.
 *
 * Postcondition IDs:
 *   run-no-error-handling
 *   run-prediction-failure-swallowed
 *   predictions-create-no-error-handling
 *   stream-no-error-handling
 *   stream-model-not-streaming-capable
 *   wait-prediction-failure
 *   wait-canceled-prediction-not-thrown
 *   trainings-create-no-error-handling
 *   trainings-create-result-not-polled
 *   files-create-no-error-handling
 *   deployments-predictions-create-no-error-handling
 *   validatewebhook-return-value-not-checked
 *   validatewebhook-missing-headers-throws
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

// ──────────────────────────────────────────────────
// 3. stream — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_stream_missing(prompt: string) {
  const output: string[] = [];
  // SHOULD_FIRE: stream-no-error-handling — stream without try-catch
  for await (const event of replicate.stream("meta/llama-2-70b-chat", {
    input: { prompt }
  })) {
    output.push(event.toString());
  }
  return output.join('');
}

// 3. stream — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_stream_with_try_catch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: stream has try-catch
    const output: string[] = [];
    for await (const event of replicate.stream("meta/llama-2-70b-chat", {
      input: { prompt }
    })) {
      if (event.event === 'error') {
        throw new Error(`Stream error: ${event.data}`);
      }
      output.push(event.toString());
    }
    return output.join('');
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 4. trainings.create — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_trainings_create_missing() {
  // SHOULD_FIRE: trainings-create-no-error-handling — trainings.create without try-catch
  const training = await replicate.trainings.create(
    "stability-ai", "sdxl",
    "da77bc59ee60423279fd632efb4795ab731d9e3ca9705d7cb2b022af26a5f4a3",
    {
      destination: "my-org/my-fine-tuned-model",
      input: { train_data: "https://example.com/data.zip" },
    }
  );
  return training;
}

// 4. trainings.create — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_trainings_create_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: trainings.create has try-catch
    const training = await replicate.trainings.create(
      "stability-ai", "sdxl",
      "da77bc59ee60423279fd632efb4795ab731d9e3ca9705d7cb2b022af26a5f4a3",
      {
        destination: "my-org/my-fine-tuned-model",
        input: { train_data: "https://example.com/data.zip" },
      }
    );
    return training;
  } catch (error) {
    console.error('Training error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. deployments.predictions.create — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deployments_predictions_create_missing(prompt: string) {
  // SHOULD_FIRE: deployments-predictions-create-no-error-handling — deployment prediction without try-catch
  const prediction = await replicate.deployments.predictions.create(
    "my-org", "my-production-model",
    { input: { prompt } }
  );
  return prediction;
}

// 5. deployments.predictions.create — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_deployments_predictions_create_with_try_catch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: deployment prediction has try-catch
    const prediction = await replicate.deployments.predictions.create(
      "my-org", "my-production-model",
      { input: { prompt } }
    );
    return prediction;
  } catch (error) {
    console.error('Deployment prediction error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. wait — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: wait-prediction-failure
async function gt_wait_missing(predictionId: string) {
  const initialPrediction = await replicate.predictions.get(predictionId);
  // SHOULD_FIRE: wait-prediction-failure — wait without try-catch
  const completedPrediction = await replicate.wait(initialPrediction);
  return completedPrediction.output;
}

// 6. wait — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_wait_with_try_catch(predictionId: string) {
  try {
    // SHOULD_NOT_FIRE: wait has try-catch
    const initialPrediction = await replicate.predictions.get(predictionId);
    const completedPrediction = await replicate.wait(initialPrediction);
    return completedPrediction.output;
  } catch (error) {
    console.error('Wait error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 7. files.create — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_files_create_missing(fileData: Buffer) {
  // SHOULD_FIRE: files-create-no-error-handling — files.create without try-catch
  const fileObject = await replicate.files.create(fileData, {
    description: "training data",
  });
  return fileObject.urls.get;
}

// 7. files.create — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_files_create_with_try_catch(fileData: Buffer) {
  try {
    // SHOULD_NOT_FIRE: files.create has try-catch
    const fileObject = await replicate.files.create(fileData, {
      description: "training data",
    });
    return fileObject.urls.get;
  } catch (error) {
    console.error('File create error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 8. run — prediction failure swallowed (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: run-prediction-failure-swallowed
async function gt_run_swallows_prediction_failure(prompt: string) {
  try {
    const output = await replicate.run("stability-ai/sdxl", {
      input: { prompt }
    });
    return output;
  } catch (error) {
    // SHOULD_FIRE: swallows prediction failure silently
    return null;
  }
}

// ──────────────────────────────────────────────────
// 9. trainings.create — result not polled (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: trainings-create-result-not-polled
async function gt_trainings_create_uses_output_immediately() {
  const training = await replicate.trainings.create(
    "stability-ai", "sdxl",
    "da77bc59ee60423279fd632efb4795ab731d9e3ca9705d7cb2b022af26a5f4a3",
    {
      destination: "my-org/my-fine-tuned-model",
      input: { train_data: "https://example.com/data.zip" },
    }
  );
  // SHOULD_FIRE: training.output is undefined immediately after create()
  return (training.output as any)?.version;
}

// ──────────────────────────────────────────────────
// 10. wait — canceled prediction not thrown (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: wait-canceled-prediction-not-thrown
async function gt_wait_assumes_success_without_status_check(predictionId: string) {
  try {
    const initialPrediction = await replicate.predictions.get(predictionId);
    const completed = await replicate.wait(initialPrediction);
    // SHOULD_FIRE: assumes succeeded without checking completed.status
    return completed.output;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 11. validateWebhook — return value not checked (SHOULD_FIRE)
// ──────────────────────────────────────────────────

import { validateWebhook } from 'replicate';

// @expect-violation: validatewebhook-return-value-not-checked
async function gt_validatewebhook_unchecked(request: Request) {
  // SHOULD_FIRE: validatewebhook-return-value-not-checked — return value ignored
  await validateWebhook(request, process.env.REPLICATE_WEBHOOK_SECRET!);
  const body = await request.json();
  return body; // processes webhook without verifying signature
}

// 11. validateWebhook — return value checked (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_validatewebhook_checked(request: Request) {
  try {
    // SHOULD_NOT_FIRE: return value is checked
    const isValid = await validateWebhook(request, process.env.REPLICATE_WEBHOOK_SECRET!);
    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await request.json();
    return body;
  } catch (error) {
    return new Response("Invalid webhook request", { status: 400 });
  }
}
