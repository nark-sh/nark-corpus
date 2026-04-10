/**
 * Ground-truth fixture for @aws-sdk/client-secrets-manager
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited send() call.
 *
 * Postcondition IDs:
 *   aws-secrets-manager-service-error   (SecretsManagerClient.send — all commands)
 */
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  SecretsManagerServiceException,
} from '@aws-sdk/client-secrets-manager';

const smClient = new SecretsManagerClient({ region: 'us-east-1' });
const SECRET_ID = 'my-app/db-password';

// ──────────────────────────────────────────────────
// 1. GetSecretValueCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_getSecret_missing() {
  // SHOULD_FIRE: aws-secrets-manager-service-error — GetSecretValueCommand without try-catch
  const response = await smClient.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
  return response.SecretString;
}

// 1. GetSecretValueCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_getSecret_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await smClient.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
    return response.SecretString;
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      console.error(`SM error [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 2. CreateSecretCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_createSecret_missing(value: string) {
  // SHOULD_FIRE: aws-secrets-manager-service-error — CreateSecretCommand without try-catch
  await smClient.send(new CreateSecretCommand({
    Name: SECRET_ID,
    SecretString: value,
  }));
}

// 2. CreateSecretCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_createSecret_safe(value: string) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await smClient.send(new CreateSecretCommand({
      Name: SECRET_ID,
      SecretString: value,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'ResourceExistsException') {
        console.warn('Secret already exists');
        return;
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 3. UpdateSecretCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_updateSecret_missing(value: string) {
  // SHOULD_FIRE: aws-secrets-manager-service-error — UpdateSecretCommand without try-catch
  await smClient.send(new UpdateSecretCommand({
    SecretId: SECRET_ID,
    SecretString: value,
  }));
}

// 3. UpdateSecretCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_updateSecret_safe(value: string) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await smClient.send(new UpdateSecretCommand({
      SecretId: SECRET_ID,
      SecretString: value,
    }));
  } catch (error) {
    console.error('Failed to update secret:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 4. DeleteSecretCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteSecret_missing() {
  // SHOULD_FIRE: aws-secrets-manager-service-error — DeleteSecretCommand without try-catch
  await smClient.send(new DeleteSecretCommand({
    SecretId: SECRET_ID,
    ForceDeleteWithoutRecovery: true,
  }));
}

// 4. DeleteSecretCommand — with try/catch (SHOULD_NOT_FIRE, idempotent pattern)
async function gt_deleteSecret_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await smClient.send(new DeleteSecretCommand({
      SecretId: SECRET_ID,
      ForceDeleteWithoutRecovery: true,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException && error.name === 'ResourceNotFoundException') {
      return; // Already deleted
    }
    throw error;
  }
}
