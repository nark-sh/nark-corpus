import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
  SecretsManagerServiceException,
} from '@aws-sdk/client-secrets-manager';

const smClient = new SecretsManagerClient({ region: 'us-east-1' });

/**
 * CORRECT: Get secret value with proper error handling.
 * Should NOT trigger violations.
 */
async function getSecretWithErrorHandling(secretId: string): Promise<string | undefined> {
  try {
    const response = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
    return response.SecretString;
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'ResourceNotFoundException') {
        console.warn(`Secret not found: ${secretId}`);
        return undefined;
      }
      console.error(`Secrets Manager error [${error.name}]: ${error.message}`);
    } else {
      console.error('Network error:', error);
    }
    throw error;
  }
}

/**
 * CORRECT: Create secret with proper error handling.
 * Should NOT trigger violations.
 */
async function createSecretWithErrorHandling(name: string, value: string): Promise<void> {
  try {
    await smClient.send(new CreateSecretCommand({
      Name: name,
      SecretString: value,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'ResourceExistsException') {
        // Update instead
        await updateSecretWithErrorHandling(name, value);
        return;
      }
      console.error(`Failed to create secret [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * CORRECT: Update secret with proper error handling.
 * Should NOT trigger violations.
 */
async function updateSecretWithErrorHandling(secretId: string, value: string): Promise<void> {
  try {
    await smClient.send(new UpdateSecretCommand({
      SecretId: secretId,
      SecretString: value,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      console.error(`Failed to update secret [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * CORRECT: Delete secret with proper error handling (idempotent pattern).
 * Should NOT trigger violations.
 */
async function deleteSecretWithErrorHandling(secretId: string): Promise<void> {
  try {
    await smClient.send(new DeleteSecretCommand({
      SecretId: secretId,
      ForceDeleteWithoutRecovery: true,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'ResourceNotFoundException') {
        // Already deleted — idempotent
        return;
      }
      console.error(`Failed to delete secret [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * CORRECT: List secrets with proper error handling.
 * Should NOT trigger violations.
 */
async function listSecretsWithErrorHandling(): Promise<string[]> {
  const names: string[] = [];
  try {
    const response = await smClient.send(new ListSecretsCommand({}));
    for (const secret of response.SecretList ?? []) {
      if (secret.Name) names.push(secret.Name);
    }
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      console.error(`Failed to list secrets [${error.name}]: ${error.message}`);
    }
    throw error;
  }
  return names;
}
