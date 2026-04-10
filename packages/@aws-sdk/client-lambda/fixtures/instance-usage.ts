import {
  LambdaClient,
  InvokeCommand,
} from '@aws-sdk/client-lambda';

/**
 * Pattern 1: Instance as class property — VIOLATION
 */
class LambdaInvoker {
  private readonly client: LambdaClient;

  constructor() {
    this.client = new LambdaClient({ region: 'us-east-1' });
  }

  async invoke(functionArn: string, payload: unknown): Promise<Uint8Array | undefined> {
    // VIOLATION: No try-catch on instance method
    const response = await this.client.send(new InvokeCommand({
      FunctionName: functionArn,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    return response.Payload;
  }
}

/**
 * Pattern 2: Module-level singleton instance — VIOLATION
 */
const globalLambdaClient = new LambdaClient({ region: 'us-east-1' });

async function invokeFunction(functionArn: string, payload: unknown): Promise<Uint8Array | undefined> {
  // VIOLATION: No try-catch on module-level instance
  const response = await globalLambdaClient.send(new InvokeCommand({
    FunctionName: functionArn,
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
  return response.Payload;
}
