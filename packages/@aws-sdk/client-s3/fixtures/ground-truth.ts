/**
 * @aws-sdk/client-s3 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@aws-sdk/client-s3"):
 *   - s3Client.send(GetObjectCommand)         postcondition: s3-object-operation-no-try-catch
 *   - s3Client.send(PutObjectCommand)         postcondition: s3-object-operation-no-try-catch
 *   - s3Client.send(DeleteObjectCommand)      postcondition: s3-object-operation-no-try-catch
 *   - s3Client.send(DeleteObjectsCommand)     postcondition: s3-batch-delete-errors-not-checked
 *   - s3Client.send(AbortMultipartUploadCommand) postcondition: s3-abort-multipart-no-try-catch
 *   - s3Client.send(RestoreObjectCommand)     postcondition: s3-restore-object-no-try-catch
 *   - waitUntilObjectExists()                 postcondition: s3-waiter-timeout-not-handled
 *   - waitUntilBucketExists()                 postcondition: s3-bucket-waiter-timeout-not-handled
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires send() without try-catch
 *   - Response-pattern: s3-batch-delete-errors-not-checked requires response.Errors check
 *   - Waiter functions: waitUntilObjectExists/waitUntilBucketExists standalone imports
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  AbortMultipartUploadCommand,
  RestoreObjectCommand,
} from '@aws-sdk/client-s3';
import { waitUntilObjectExists, waitUntilBucketExists } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. GetObject — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getObjectNoCatch(bucket: string, key: string) {
  // SHOULD_FIRE: s3-object-operation-no-try-catch — s3Client.send(GetObjectCommand) without try-catch throws on NoSuchKey/AccessDenied
  const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return response.Body;
}

export async function getObjectWithCatch(bucket: string, key: string) {
  try {
    // SHOULD_NOT_FIRE: s3Client.send(GetObjectCommand) inside try-catch satisfies error handling
    const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response.Body;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      console.error(`Object ${key} not found`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PutObject — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function putObjectNoCatch(bucket: string, key: string, body: Buffer) {
  // SHOULD_FIRE: s3-object-operation-no-try-catch — s3Client.send(PutObjectCommand) without try-catch throws on AccessDenied/NoSuchBucket
  await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
}

export async function putObjectWithCatch(bucket: string, key: string, body: Buffer) {
  try {
    // SHOULD_NOT_FIRE: s3Client.send(PutObjectCommand) inside try-catch satisfies error handling
    await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
  } catch (error: any) {
    console.error('Upload failed:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DeleteObject — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteObjectNoCatch(bucket: string, key: string) {
  // SHOULD_FIRE: s3-object-operation-no-try-catch — s3Client.send(DeleteObjectCommand) without try-catch throws on AccessDenied
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DeleteObjectsCommand — batch delete, silent failure in response.Errors
// NOTE: s3-batch-delete-errors-not-checked is a RESPONSE-PATTERN postcondition —
// the scanner does not yet detect missing response.Errors checks. Scanner concern
// queued: concern-20260406-aws-sdk-client-s3-deepen-1. These cases are annotated
// as FUTURE_SHOULD_FIRE pending scanner upgrade.
// ─────────────────────────────────────────────────────────────────────────────

export async function batchDeleteNoCatch(bucket: string, keys: string[]) {
  // FUTURE_SHOULD_FIRE: s3-batch-delete-errors-not-checked — no scanner rule yet (queued as scanner concern)
  // response.Errors not checked; individual deletions fail silently
  try {
    await s3Client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map(k => ({ Key: k })) },
    }));
    // Missing: response.Errors check
  } catch (error: any) {
    throw error;
  }
}

export async function batchDeleteWithErrorCheck(bucket: string, keys: string[]) {
  // CLEAN: response.Errors is checked after batch delete — correct pattern
  try {
    const response = await s3Client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map(k => ({ Key: k })) },
    }));
    if (response.Errors && response.Errors.length > 0) {
      const failed = response.Errors.map(e => e.Key).join(', ');
      throw new Error(`Failed to delete: ${failed}`);
    }
  } catch (error: any) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AbortMultipartUploadCommand — cleanup in catch block, itself can throw
// NOTE: s3-abort-multipart-no-try-catch is pending scanner rule in S3_COMMAND_MAP
// (currently AbortMultipartUploadCommand maps to s3-multipart-no-try-catch)
// ─────────────────────────────────────────────────────────────────────────────

export async function abortMultipartNoCatch(bucket: string, key: string, uploadId: string) {
  // SHOULD_FIRE: s3-multipart-no-try-catch — AbortMultipartUploadCommand without try-catch (existing rule covers this)
  await s3Client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
}

export async function abortMultipartWithCatch(bucket: string, key: string, uploadId: string) {
  try {
    // SHOULD_NOT_FIRE: AbortMultipartUploadCommand inside try-catch handles NoSuchUpload
    await s3Client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
  } catch (error: any) {
    if (error.name === 'NoSuchUpload') {
      // Already aborted or completed — safe to ignore
      return;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RestoreObjectCommand — Glacier restore, ObjectAlreadyInActiveTierError
// NOTE: s3-restore-object-no-try-catch needs scanner rule: add RestoreObjectCommand
// to S3_COMMAND_POSTCONDITION_MAP (queued as scanner concern)
// ─────────────────────────────────────────────────────────────────────────────

export async function restoreObjectNoCatch(bucket: string, key: string) {
  // SHOULD_FIRE: s3-object-operation-no-try-catch — RestoreObjectCommand without try-catch (fallback to most-severe)
  await s3Client.send(new RestoreObjectCommand({
    Bucket: bucket,
    Key: key,
    RestoreRequest: { Days: 3, GlacierJobParameters: { Tier: 'Standard' } },
  }));
}

export async function restoreObjectWithCatch(bucket: string, key: string) {
  try {
    // SHOULD_NOT_FIRE: RestoreObjectCommand inside try-catch handles ObjectAlreadyInActiveTierError
    await s3Client.send(new RestoreObjectCommand({
      Bucket: bucket,
      Key: key,
      RestoreRequest: { Days: 3, GlacierJobParameters: { Tier: 'Standard' } },
    }));
  } catch (error: any) {
    if (error.name === 'ObjectAlreadyInActiveTierError' || error.name === 'RestoreAlreadyInProgress') {
      return; // Object is accessible or restore already running
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. waitUntilObjectExists — waiter TimeoutError not handled
// ─────────────────────────────────────────────────────────────────────────────

export async function waitObjectExistsNoCatch(bucket: string, key: string) {
  // FUTURE_SHOULD_FIRE: s3-waiter-timeout-not-handled — no scanner rule yet (queued concern-20260406-aws-sdk-client-s3-deepen-3)
  // waitUntilObjectExists without try-catch throws TimeoutError from @smithy/util-waiter
  await waitUntilObjectExists({ client: s3Client, maxWaitTime: 30 }, { Bucket: bucket, Key: key });
}

export async function waitObjectExistsWithCatch(bucket: string, key: string) {
  try {
    // SHOULD_NOT_FIRE: waitUntilObjectExists inside try-catch handles TimeoutError
    await waitUntilObjectExists({ client: s3Client, maxWaitTime: 30 }, { Bucket: bucket, Key: key });
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Object ${key} did not appear within 30 seconds`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. waitUntilBucketExists — bucket waiter TimeoutError not handled
// ─────────────────────────────────────────────────────────────────────────────

export async function waitBucketExistsNoCatch(bucket: string) {
  // FUTURE_SHOULD_FIRE: s3-bucket-waiter-timeout-not-handled — no scanner rule yet (queued concern-20260406-aws-sdk-client-s3-deepen-3)
  // waitUntilBucketExists without try-catch throws TimeoutError from @smithy/util-waiter
  await waitUntilBucketExists({ client: s3Client, maxWaitTime: 60 }, { Bucket: bucket });
}

export async function waitBucketExistsWithCatch(bucket: string) {
  try {
    // SHOULD_NOT_FIRE: waitUntilBucketExists inside try-catch handles TimeoutError
    await waitUntilBucketExists({ client: s3Client, maxWaitTime: 60 }, { Bucket: bucket });
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Bucket ${bucket} did not become accessible within 60 seconds`);
    }
    throw error;
  }
}
