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
  UpdateSecretVersionStageCommand,
  CancelRotateSecretCommand,
  PutResourcePolicyCommand,
  RestoreSecretCommand,
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


// ──────────────────────────────────────────────────
// 8. UpdateSecretVersionStageCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: update-secret-version-stage-no-try-catch
async function gt_updateVersionStage_missing(newVersionId: string, oldVersionId: string) {
  // SHOULD_FIRE: aws-secrets-manager-service-error, update-secret-version-stage-no-try-catch
  await smClient.send(new UpdateSecretVersionStageCommand({
    SecretId: SECRET_ID,
    VersionStage: 'AWSCURRENT',
    MoveToVersionId: newVersionId,
    RemoveFromVersionId: oldVersionId,
  }));
}

// @expect-clean
async function gt_updateVersionStage_safe(newVersionId: string, oldVersionId: string) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await smClient.send(new UpdateSecretVersionStageCommand({
      SecretId: SECRET_ID,
      VersionStage: 'AWSCURRENT',
      MoveToVersionId: newVersionId,
      RemoveFromVersionId: oldVersionId,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'LimitExceededException') {
        console.error('Too many staging labels — clean up old labels first');
      } else if (error.name === 'InvalidRequestException') {
        console.error('Version stage update failed — check version IDs and secret state:', error.message);
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 9. CancelRotateSecretCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: cancel-rotate-secret-no-try-catch
async function gt_cancelRotateSecret_missing() {
  // SHOULD_FIRE: aws-secrets-manager-service-error, cancel-rotate-secret-no-try-catch
  await smClient.send(new CancelRotateSecretCommand({
    SecretId: SECRET_ID,
  }));
}

// @expect-violation: cancel-rotate-secret-orphaned-pending-version
async function gt_cancelRotateSecret_pendingNotCleaned() {
  try {
    // SHOULD_FIRE: cancel-rotate-secret-orphaned-pending-version
    // response.VersionId checked but AWSPENDING label not removed from orphaned version
    const result = await smClient.send(new CancelRotateSecretCommand({
      SecretId: SECRET_ID,
    }));
    // ❌ VersionId logged but AWSPENDING label not cleaned up — blocks future rotations
    if (result.VersionId) {
      console.log(`Cancelled rotation, orphaned version: ${result.VersionId}`);
      // Missing: UpdateSecretVersionStageCommand to remove AWSPENDING label
    }
  } catch (error) {
    throw error;
  }
}

// @expect-clean
async function gt_cancelRotateSecret_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch and response.VersionId is cleaned up
    const result = await smClient.send(new CancelRotateSecretCommand({
      SecretId: SECRET_ID,
    }));
    if (result.VersionId) {
      // ✅ Clean up orphaned AWSPENDING label to unblock future rotations
      await smClient.send(new UpdateSecretVersionStageCommand({
        SecretId: SECRET_ID,
        VersionStage: 'AWSPENDING',
        RemoveFromVersionId: result.VersionId,
      }));
    }
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      console.error(`Cancel rotation failed [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 10. PutResourcePolicyCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: put-resource-policy-no-try-catch
async function gt_putResourcePolicy_missing(policy: string) {
  // SHOULD_FIRE: aws-secrets-manager-service-error, put-resource-policy-no-try-catch
  await smClient.send(new PutResourcePolicyCommand({
    SecretId: SECRET_ID,
    ResourcePolicy: policy,
    BlockPublicPolicy: true,
  }));
}

// @expect-clean
async function gt_putResourcePolicy_safe(policy: string) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await smClient.send(new PutResourcePolicyCommand({
      SecretId: SECRET_ID,
      ResourcePolicy: policy,
      BlockPublicPolicy: true,
    }));
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'PublicPolicyException') {
        console.error('SECURITY: Policy grants overly broad access — rejected by BlockPublicPolicy');
        throw new Error('Policy rejected: grants public access to secret');
      } else if (error.name === 'MalformedPolicyDocumentException') {
        console.error('Policy JSON syntax error:', error.message);
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 11. RestoreSecretCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: restore-secret-no-try-catch
async function gt_restoreSecret_missing() {
  // SHOULD_FIRE: aws-secrets-manager-service-error, restore-secret-no-try-catch
  await smClient.send(new RestoreSecretCommand({
    SecretId: SECRET_ID,
  }));
}

// @expect-clean
async function gt_restoreSecret_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const result = await smClient.send(new RestoreSecretCommand({
      SecretId: SECRET_ID,
    }));
    console.log(`Secret restored: ${result.ARN}`);
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === 'InvalidRequestException') {
        console.error('Secret is not scheduled for deletion (or was force-deleted with no recovery window):', error.message);
      } else if (error.name === 'ResourceNotFoundException') {
        console.error('Secret not found:', error.message);
      }
    }
    throw error;
  }
}
