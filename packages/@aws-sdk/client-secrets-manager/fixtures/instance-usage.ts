import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * Pattern 1: Instance as class property — VIOLATION
 */
class SecretsService {
  private readonly client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({ region: 'us-east-1' });
  }

  async getSecret(secretId: string): Promise<string | undefined> {
    // VIOLATION: No try-catch on instance method
    const response = await this.client.send(new GetSecretValueCommand({ SecretId: secretId }));
    return response.SecretString;
  }

  async createSecret(name: string, value: string): Promise<void> {
    // VIOLATION: No try-catch on instance method
    await this.client.send(new CreateSecretCommand({
      Name: name,
      SecretString: value,
    }));
  }
}

/**
 * Pattern 2: Module-level singleton instance — VIOLATION
 */
const globalSmClient = new SecretsManagerClient({ region: 'us-east-1' });

async function fetchSecret(secretId: string): Promise<string | undefined> {
  // VIOLATION: No try-catch on module-level instance
  const response = await globalSmClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  return response.SecretString;
}

/**
 * Pattern 3: Factory function — VIOLATION
 */
function createSmClient(): SecretsManagerClient {
  return new SecretsManagerClient({ region: 'us-east-1' });
}

async function getSecretViaFactory(secretId: string): Promise<string | undefined> {
  const client = createSmClient();
  // VIOLATION: No try-catch
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
  return response.SecretString;
}
