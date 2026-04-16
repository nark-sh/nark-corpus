/**
 * Ground-truth fixture for @aws-sdk/client-lambda
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited send() call.
 *
 * Postcondition IDs:
 *   aws-lambda-service-error                         (LambdaClient.send — all commands)
 *   aws-lambda-invoke-function-error-unchecked        (InvokeCommand — FunctionError not checked)
 *   aws-lambda-stream-no-error-handling               (InvokeWithResponseStreamCommand — no try-catch)
 *   aws-lambda-stream-invokecomplete-errorcode-unchecked (InvokeWithResponseStream — ErrorCode not checked)
 *   aws-lambda-waiter-no-error-handling               (waitUntilFunctionActive — no try-catch)
 *   aws-lambda-update-waiter-no-error-handling        (waitUntilFunctionUpdated — no try-catch)
 *   aws-lambda-create-no-error-handling               (CreateFunctionCommand — no try-catch)
 */
import {
  LambdaClient,
  InvokeCommand,
  InvokeWithResponseStreamCommand,
  UpdateFunctionCodeCommand,
  CreateFunctionCommand,
  DeleteFunctionCommand,
  LambdaServiceException,
} from '@aws-sdk/client-lambda';
import {
  waitUntilFunctionActive,
  waitUntilFunctionActiveV2,
  waitUntilFunctionUpdated,
  waitUntilFunctionUpdatedV2,
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

// ──────────────────────────────────────────────────
// 4. InvokeCommand — FunctionError not checked (NOTE: needs new scanner detection rule)
// aws-lambda-invoke-function-error-unchecked is a silent-failure pattern (HTTP 200, no throw)
// The existing scanner detects try-catch absence but not missing FunctionError checks.
// This function has try-catch so aws-lambda-service-error should NOT fire.
// Detection for invoke-function-error-unchecked is queued as scanner concern.
async function gt_invoke_function_error_unchecked(payload: unknown) {
  // SHOULD_NOT_FIRE: has try-catch (aws-lambda-service-error covered), FunctionError check omitted intentionally
  // No SHOULD_FIRE annotation here — scanner rule for FunctionError-unchecked not yet implemented
  try {
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    // Missing check: if (response.FunctionError) — needs new scanner rule
    return JSON.parse(Buffer.from(response.Payload!).toString());
  } catch (error) {
    throw error;
  }
}

// 4. InvokeCommand — FunctionError properly checked (SHOULD_NOT_FIRE)
async function gt_invoke_function_error_checked(payload: unknown) {
  try {
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    // SHOULD_NOT_FIRE: FunctionError is checked
    if (response.FunctionError) {
      const errorPayload = JSON.parse(Buffer.from(response.Payload!).toString());
      throw new Error(`Lambda function error: ${response.FunctionError} — ${errorPayload.errorMessage}`);
    }
    return JSON.parse(Buffer.from(response.Payload!).toString());
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. InvokeWithResponseStreamCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// NOTE: scanner fires aws-lambda-service-error (generic send rule) for missing try-catch.
// aws-lambda-stream-no-error-handling (stream-specific postcondition) requires new scanner rule.
async function gt_stream_missing_try_catch(payload: unknown) {
  // SHOULD_FIRE: aws-lambda-service-error — InvokeWithResponseStreamCommand without try-catch
  const response = await lambdaClient.send(new InvokeWithResponseStreamCommand({
    FunctionName: FUNCTION_ARN,
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
  for await (const event of response.EventStream!) {
    if (event.PayloadChunk) {
      process.stdout.write(Buffer.from(event.PayloadChunk.Payload!).toString());
    }
  }
}

// 5. InvokeWithResponseStreamCommand — with try/catch but no ErrorCode check
// NOTE: aws-lambda-stream-invokecomplete-errorcode-unchecked needs new scanner detection rule
// This function has try-catch so aws-lambda-service-error should NOT fire.
async function gt_stream_missing_errorcode_check(payload: unknown) {
  try {
    const response = await lambdaClient.send(new InvokeWithResponseStreamCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    for await (const event of response.EventStream!) {
      if (event.PayloadChunk) {
        process.stdout.write(Buffer.from(event.PayloadChunk.Payload!).toString());
      }
      if (event.InvokeComplete) {
        // SHOULD_NOT_FIRE: has try-catch. Missing ErrorCode check needs new scanner rule.
        // Detection for aws-lambda-stream-invokecomplete-errorcode-unchecked is queued.
      }
    }
  } catch (error) {
    throw error;
  }
}

// 5. InvokeWithResponseStreamCommand — fully correct (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_stream_with_all_checks(payload: unknown) {
  try {
    const response = await lambdaClient.send(new InvokeWithResponseStreamCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    for await (const event of response.EventStream!) {
      if (event.PayloadChunk) {
        process.stdout.write(Buffer.from(event.PayloadChunk.Payload!).toString());
      }
      if (event.InvokeComplete) {
        // SHOULD_NOT_FIRE: ErrorCode is checked
        if (event.InvokeComplete.ErrorCode) {
          throw new Error(
            `Streaming function error: ${event.InvokeComplete.ErrorCode} — ${event.InvokeComplete.ErrorDetails}`
          );
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. waitUntilFunctionActive — no try/catch
// NOTE: aws-lambda-waiter-no-error-handling needs new scanner detection rule for waiter calls.
// Waiter functions are not client.send() calls, so existing generic rule doesn't apply.
// Scanner concern queued. These functions document the correct/incorrect usage patterns.
// ──────────────────────────────────────────────────

async function gt_wait_function_active_missing(functionName: string) {
  // Missing try-catch around waiter — TimeoutError when function stays Pending.
  // Detection gap: scanner doesn't yet detect missing try-catch on waiter calls.
  await waitUntilFunctionActiveV2(
    { client: lambdaClient, maxWaitTime: 300 },
    { FunctionName: functionName }
  );
}

// 6. waitUntilFunctionActive — with try/catch (SHOULD_NOT_FIRE)
async function gt_wait_function_active_safe(functionName: string) {
  try {
    // SHOULD_NOT_FIRE: waiter has try-catch — correct pattern
    await waitUntilFunctionActiveV2(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName }
    );
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Function ${functionName} did not become active within 5 minutes`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 7. waitUntilFunctionUpdated — no try/catch
// NOTE: same detection gap as waitUntilFunctionActive — scanner concern queued.
// ──────────────────────────────────────────────────

async function gt_wait_function_updated_missing(functionName: string) {
  // Missing try-catch around update waiter — TimeoutError when update stalls.
  await waitUntilFunctionUpdatedV2(
    { client: lambdaClient, maxWaitTime: 300 },
    { FunctionName: functionName }
  );
}

// 7. waitUntilFunctionUpdated — with try/catch (SHOULD_NOT_FIRE)
async function gt_wait_function_updated_safe(functionName: string) {
  try {
    // SHOULD_NOT_FIRE: waiter has try-catch — correct pattern
    await waitUntilFunctionUpdatedV2(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName }
    );
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Function ${functionName} update did not complete within 5 minutes`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 8. CreateFunctionCommand — no try/catch (SHOULD_FIRE)
// The generic aws-lambda-service-error rule covers CreateFunctionCommand missing try-catch.
// ──────────────────────────────────────────────────

async function gt_create_function_missing(
  functionName: string,
  roleArn: string,
  zipBuffer: Uint8Array
) {
  // ResourceConflictException if function already exists; CodeStorageExceededException on quota
  // SHOULD_FIRE: aws-lambda-service-error — CreateFunctionCommand without try-catch
  await lambdaClient.send(new CreateFunctionCommand({
    FunctionName: functionName,
    Runtime: 'nodejs22.x',
    Role: roleArn,
    Handler: 'index.handler',
    Code: { ZipFile: zipBuffer },
  }));
}

// 8. CreateFunctionCommand — with try/catch + ResourceConflictException handling (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_create_function_safe(
  functionName: string,
  roleArn: string,
  zipBuffer: Uint8Array
) {
  try {
    // SHOULD_NOT_FIRE: CreateFunctionCommand has try-catch
    await lambdaClient.send(new CreateFunctionCommand({
      FunctionName: functionName,
      Runtime: 'nodejs22.x',
      Role: roleArn,
      Handler: 'index.handler',
      Code: { ZipFile: zipBuffer },
    }));
  } catch (error: any) {
    if (error.name === 'ResourceConflictException') {
      // Function already exists — update code instead
      await lambdaClient.send(new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ZipFile: zipBuffer,
      }));
    } else if (error.name === 'CodeStorageExceededException') {
      throw new Error('Lambda code storage quota exceeded — delete old function versions');
    } else {
      throw error;
    }
  }
}
