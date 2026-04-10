import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
} from '@aws-sdk/client-secrets-manager';

const smClient = new SecretsManagerClient({ region: 'us-east-1' });

/**
 * VIOLATION: Get secret without try-catch.
 * Application crashes if secret doesn't exist or permissions are missing.
 */
async function getSecretNoCatch(secretId: string): Promise<string | undefined> {
  const response = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  return response.SecretString;
}

/**
 * VIOLATION: Create secret without try-catch.
 * Silent failure if secret already exists or IAM permissions are missing.
 */
async function createSecretNoCatch(name: string, value: string): Promise<void> {
  await smClient.send(new CreateSecretCommand({
    Name: name,
    SecretString: value,
  }));
}

/**
 * VIOLATION: Update secret without try-catch.
 * Unhandled rejection if secret doesn't exist or is scheduled for deletion.
 */
async function updateSecretNoCatch(secretId: string, value: string): Promise<void> {
  await smClient.send(new UpdateSecretCommand({
    SecretId: secretId,
    SecretString: value,
  }));
}

/**
 * VIOLATION: Delete secret without try-catch.
 * Crashes if secret doesn't exist (ResourceNotFoundException).
 */
async function deleteSecretNoCatch(secretId: string): Promise<void> {
  await smClient.send(new DeleteSecretCommand({
    SecretId: secretId,
    ForceDeleteWithoutRecovery: true,
  }));
}

/**
 * VIOLATION: List secrets without try-catch.
 * Crashes if IAM permissions are missing.
 */
async function listSecretsNoCatch(): Promise<string[]> {
  const names: string[] = [];
  const response = await smClient.send(new ListSecretsCommand({}));
  for (const secret of response.SecretList ?? []) {
    if (secret.Name) names.push(secret.Name);
  }
  return names;
}
