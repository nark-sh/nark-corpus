import {
  LambdaClient,
  InvokeCommand,
  UpdateFunctionCodeCommand,
  DeleteFunctionCommand,
  ListFunctionsCommand,
  LambdaServiceException,
} from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({ region: 'us-east-1' });
const FUNCTION_ARN = 'arn:aws:lambda:us-east-1:123456789:function:my-function';

/**
 * CORRECT: Invoke function with proper error handling.
 * Should NOT trigger violations.
 */
async function invokeFunctionWithErrorHandling(payload: unknown): Promise<Uint8Array | undefined> {
  try {
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    if (response.FunctionError) {
      throw new Error(`Lambda application error: ${response.FunctionError}`);
    }
    return response.Payload;
  } catch (error) {
    if (error instanceof LambdaServiceException) {
      console.error(`Lambda error [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * CORRECT: Update function code with error handling.
 * Should NOT trigger violations.
 */
async function updateFunctionCodeWithErrorHandling(zipBuffer: Uint8Array): Promise<void> {
  try {
    await lambdaClient.send(new UpdateFunctionCodeCommand({
      FunctionName: FUNCTION_ARN,
      ZipFile: zipBuffer,
    }));
  } catch (error) {
    if (error instanceof LambdaServiceException) {
      console.error(`Update failed [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * CORRECT: Delete function with idempotent handling.
 * Should NOT trigger violations.
 */
async function deleteFunctionWithErrorHandling(): Promise<void> {
  try {
    await lambdaClient.send(new DeleteFunctionCommand({
      FunctionName: FUNCTION_ARN,
    }));
  } catch (error) {
    if (error instanceof LambdaServiceException) {
      if (error.name === 'ResourceNotFoundException') {
        return; // Already deleted
      }
    }
    throw error;
  }
}

/**
 * CORRECT: List functions with error handling.
 * Should NOT trigger violations.
 */
async function listFunctionsWithErrorHandling() {
  try {
    const response = await lambdaClient.send(new ListFunctionsCommand({}));
    return response.Functions ?? [];
  } catch (error) {
    if (error instanceof LambdaServiceException) {
      console.error(`List failed [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}
