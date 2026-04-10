import {
  LambdaClient,
  InvokeCommand,
  UpdateFunctionCodeCommand,
  DeleteFunctionCommand,
  ListFunctionsCommand,
} from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({ region: 'us-east-1' });
const FUNCTION_ARN = 'arn:aws:lambda:us-east-1:123456789:function:my-function';

/**
 * VIOLATION: Invoke without try-catch.
 * Function invocation fails silently if function doesn't exist, throttled, or permission denied.
 */
async function invokeFunctionNoCatch(payload: unknown) {
  const response = await lambdaClient.send(new InvokeCommand({
    FunctionName: FUNCTION_ARN,
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
  return response.Payload;
}

/**
 * VIOLATION: Update function code without try-catch.
 * Deployment fails silently if function doesn't exist or code exceeds size limit.
 */
async function updateFunctionCodeNoCatch(zipBuffer: Uint8Array) {
  await lambdaClient.send(new UpdateFunctionCodeCommand({
    FunctionName: FUNCTION_ARN,
    ZipFile: zipBuffer,
  }));
}

/**
 * VIOLATION: Delete function without try-catch.
 * Crashes if function doesn't exist (ResourceNotFoundException).
 */
async function deleteFunctionNoCatch() {
  await lambdaClient.send(new DeleteFunctionCommand({
    FunctionName: FUNCTION_ARN,
  }));
}

/**
 * VIOLATION: List functions without try-catch.
 * Crashes if IAM permissions are missing.
 */
async function listFunctionsNoCatch() {
  const response = await lambdaClient.send(new ListFunctionsCommand({}));
  return response.Functions ?? [];
}
