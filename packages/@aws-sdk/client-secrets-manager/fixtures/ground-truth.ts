/**
 * Ground-truth fixture for @aws-sdk/client-secrets-manager
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited send() call.
 *
 * Postcondition IDs:
 *   aws-secrets-manager-service-error              (send — generic, all commands)
 *   get-secret-value-no-try-catch                  (GetSecretValueCommand without try-catch)
 *   get-secret-value-not-found                     (ResourceNotFoundException handling)
 *   get-secret-value-decryption-failure            (DecryptionFailure handling)
 *   batch-get-secret-no-try-catch                  (BatchGetSecretValueCommand without try-catch)
 *   batch-get-secret-partial-failure-unchecked     (response.Errors[] not checked)
 *   create-secret-no-try-catch                     (CreateSecretCommand without try-catch)
 *   create-secret-already-exists                   (ResourceExistsException handling)
 *   create-secret-kms-encryption-failure           (EncryptionFailure handling)
 *   create-secret-limit-exceeded                   (LimitExceededException handling)
 *   put-secret-value-no-try-catch                  (PutSecretValueCommand without try-catch)
 *   put-secret-value-secret-not-found              (ResourceNotFoundException handling)
 *   put-secret-value-version-conflict              (ResourceExistsException handling)
 *   put-secret-value-throttling                    (LimitExceededException handling)
 *   update-secret-no-try-catch                     (UpdateSecretCommand without try-catch)
 *   update-secret-not-found                        (ResourceNotFoundException handling)
 *   update-secret-kms-errors                       (DecryptionFailure/EncryptionFailure handling)
 *   delete-secret-no-try-catch                     (DeleteSecretCommand without try-catch)
 *   delete-secret-recovery-window-not-immediate    (recovery window behavior awareness)
 *   rotate-secret-no-try-catch                     (RotateSecretCommand without try-catch)
 *   rotate-secret-lambda-not-configured            (InvalidRequestException — no Lambda)
 *   rotate-secret-in-progress                      (InvalidRequestException — rotation in progress)
 *   rotate-secret-async-completion-assumed         (async rotation, immediate read after rotate)
 */
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  BatchGetSecretValueCommand,
  CreateSecretCommand,
  PutSecretValueCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  RotateSecretCommand,
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

// ──────────────────────────────────────────────────
// 5. BatchGetSecretValueCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: batch-get-secret-no-try-catch
// @expect-violation: batch-get-secret-partial-failure-unchecked
async function gt_batchGetSecret_missing() {
  // SHOULD_FIRE: aws-secrets-manager-service-error, batch-get-secret-no-try-catch
  // SHOULD_FIRE: batch-get-secret-partial-failure-unchecked — response.Errors[] not checked
  const response = await smClient.send(new BatchGetSecretValueCommand({
    SecretIdList: [SECRET_ID, 'another-secret'],
  }));
  // Only iterating SecretValues — Errors[] never checked
  return response.SecretValues?.map(s => s.SecretString);
}

// 5. BatchGetSecretValueCommand — with try/catch BUT missing Errors check (SHOULD_FIRE partial-failure)
// @expect-violation: batch-get-secret-partial-failure-unchecked
async function gt_batchGetSecret_tryCatchNoErrorsCheck() {
  try {
    const response = await smClient.send(new BatchGetSecretValueCommand({
      SecretIdList: [SECRET_ID, 'another-secret'],
    }));
    // SHOULD_FIRE: batch-get-secret-partial-failure-unchecked
    // Has try-catch but never inspects response.Errors[] — silent partial failure
    return response.SecretValues;
  } catch (error) {
    console.error('Batch fetch failed:', error);
    throw error;
  }
}

// @expect-clean
async function gt_batchGetSecret_safe() {
  try {
    const response = await smClient.send(new BatchGetSecretValueCommand({
      SecretIdList: [SECRET_ID, 'another-secret'],
    }));
    // SHOULD_NOT_FIRE: properly checks both SecretValues and Errors
    if (response.Errors && response.Errors.length > 0) {
      const failures = response.Errors.map(e =>
        `${e.SecretId}: ${e.ErrorCode} — ${e.Message}`
      ).join('\n');
      throw new Error(`BatchGetSecretValue partial failure:\n${failures}`);
    }
    return response.SecretValues;
  } catch (error) {
    console.error('Batch get secret error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. PutSecretValueCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: put-secret-value-no-try-catch
async function gt_putSecretValue_missing(newValue: string) {
  // SHOULD_FIRE: aws-secrets-manager-service-error, put-secret-value-no-try-catch
  await smClient.send(new PutSecretValueCommand({
    SecretId: SECRET_ID,
    SecretString: newValue,
  }));
}

// @expect-clean
async function gt_putSecretValue_safe(newValue: string) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await smClient.send(new PutSecretValueCommand({
      SecretId: SECRET_ID,
      SecretString: newValue,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      console.error(`PutSecretValue error [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 7. RotateSecretCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: rotate-secret-no-try-catch
async function gt_rotateSecret_missing() {
  // SHOULD_FIRE: aws-secrets-manager-service-error, rotate-secret-no-try-catch
  await smClient.send(new RotateSecretCommand({
    SecretId: SECRET_ID,
    RotateImmediately: true,
  }));
}

// @expect-clean
async function gt_rotateSecret_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const result = await smClient.send(new RotateSecretCommand({
      SecretId: SECRET_ID,
      RotateImmediately: true,
    }));
    console.log(`Rotation initiated, new version: ${result.VersionId}`);
    // Note: Do NOT read new secret immediately — rotation is async
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'InvalidRequestException') {
        console.error('Rotation config error (Lambda not set, or rotation in progress):', error.message);
      }
    }
    throw error;
  }
}
