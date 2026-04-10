/**
 * Ground-truth fixture for @aws-sdk/client-lambda
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited send() call.
 *
 * Postcondition IDs:
 *   aws-lambda-service-error   (LambdaClient.send — all commands)
 */
import {
  LambdaClient,
  InvokeCommand,
  UpdateFunctionCodeCommand,
  CreateFunctionCommand,
  DeleteFunctionCommand,
  LambdaServiceException,
} from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({ region: 'us-east-1' });
const FUNCTION_ARN = 'arn:aws:lambda:us-east-1:123456789:function:my-function';

// ──────────────────────────────────────────────────
// 1. InvokeCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_invoke_missing(payload: unknown) {
  // SHOULD_FIRE: aws-lambda-service-error — InvokeCommand without try-catch
  const response = await lambdaClient.send(new InvokeCommand({
    FunctionName: FUNCTION_ARN,
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
  return response.Payload;
}

// 1. InvokeCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_invoke_safe(payload: unknown) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    return response.Payload;
  } catch (error) {
    if (error instanceof LambdaServiceException) {
      console.error(`Lambda error [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 2. UpdateFunctionCodeCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_updateCode_missing(zipBuffer: Uint8Array) {
  // SHOULD_FIRE: aws-lambda-service-error — UpdateFunctionCodeCommand without try-catch
  await lambdaClient.send(new UpdateFunctionCodeCommand({
    FunctionName: FUNCTION_ARN,
    ZipFile: zipBuffer,
  }));
}

// 2. UpdateFunctionCodeCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_updateCode_safe(zipBuffer: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await lambdaClient.send(new UpdateFunctionCodeCommand({
      FunctionName: FUNCTION_ARN,
      ZipFile: zipBuffer,
    }));
  } catch (error) {
    console.error('Failed to update function code:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 3. DeleteFunctionCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteFunction_missing() {
  // SHOULD_FIRE: aws-lambda-service-error — DeleteFunctionCommand without try-catch
  await lambdaClient.send(new DeleteFunctionCommand({
    FunctionName: FUNCTION_ARN,
  }));
}

// 3. DeleteFunctionCommand — with try/catch (SHOULD_NOT_FIRE, idempotent pattern)
async function gt_deleteFunction_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await lambdaClient.send(new DeleteFunctionCommand({
      FunctionName: FUNCTION_ARN,
    }));
  } catch (error) {
    if (error instanceof LambdaServiceException && error.name === 'ResourceNotFoundException') {
      return; // Already deleted
    }
    throw error;
  }
}
