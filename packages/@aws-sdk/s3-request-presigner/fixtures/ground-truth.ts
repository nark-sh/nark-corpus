/**
 * @aws-sdk/s3-request-presigner Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Postcondition IDs:
 *   presigner-credential-error         (getSignedUrl)
 *   presigner-post-credential-error    (createPresignedPost)
 *
 * Detection pattern:
 *   - getSignedUrl imported from @aws-sdk/s3-request-presigner
 *   - ThrowingFunctionDetector (depth-0): direct call getSignedUrl(...) → detected
 *   - ContractMatcher: matches function 'getSignedUrl' → checks try-catch
 */

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. getSignedUrl without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getSignedUrl_missing(bucket: string, key: string) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  // SHOULD_FIRE: presigner-credential-error — getSignedUrl without try-catch
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. getSignedUrl with try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getSignedUrl_safe(bucket: string, key: string) {
  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    // SHOULD_NOT_FIRE: getSignedUrl inside try-catch satisfies error handling
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error('Failed to sign URL:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PutObject getSignedUrl without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getSignedUrl_put_missing(bucket: string, key: string) {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key });
  // SHOULD_FIRE: presigner-credential-error — PutObjectCommand getSignedUrl without try-catch
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: 900 });
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PutObject getSignedUrl with try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getSignedUrl_put_safe(bucket: string, key: string) {
  try {
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key });
    // SHOULD_NOT_FIRE: PutObjectCommand getSignedUrl inside try-catch
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: 900 });
    return url;
  } catch (err) {
    console.error('Failed to sign upload URL:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. createPresignedPost without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createPresignedPost_missing(bucket: string, key: string) {
  // SHOULD_NOT_FIRE: createPresignedPost belongs to @aws-sdk/s3-presigned-post (different package), not s3-request-presigner
  const post = await createPresignedPost(s3Client, { Bucket: bucket, Key: key, Expires: 600 });
  return post;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. createPresignedPost with try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createPresignedPost_safe(bucket: string, key: string) {
  try {
    // SHOULD_NOT_FIRE: createPresignedPost inside try-catch
    const post = await createPresignedPost(s3Client, { Bucket: bucket, Key: key, Expires: 600 });
    return post;
  } catch (err) {
    console.error('Failed to create upload policy:', err);
    throw err;
  }
}
