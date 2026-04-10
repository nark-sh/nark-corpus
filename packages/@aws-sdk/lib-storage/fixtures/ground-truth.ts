/**
 * @aws-sdk/lib-storage Ground-Truth Fixture
 * Postcondition IDs:
 *   upload-done-no-try-catch  (Upload.done())
 */
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({ region: 'us-east-1' });

// 1. upload.done() without try-catch (SHOULD_FIRE)
async function gt_upload_done_missing(bucket: string, key: string, body: Readable) {
  const upload = new Upload({ client: s3, params: { Bucket: bucket, Key: key, Body: body } });
  // SHOULD_FIRE: upload-done-no-try-catch — upload.done() without try-catch
  await upload.done();
}

// 2. upload.done() with try-catch (SHOULD_NOT_FIRE)
async function gt_upload_done_safe(bucket: string, key: string, body: Readable) {
  const upload = new Upload({ client: s3, params: { Bucket: bucket, Key: key, Body: body } });
  try {
    // SHOULD_NOT_FIRE: upload.done() inside try-catch
    await upload.done();
  } catch (err) {
    await upload.abort();
    throw err;
  }
}

// 3. upload.done() without try-catch — Buffer body (SHOULD_FIRE)
async function gt_upload_buffer_missing(bucket: string, key: string, content: Buffer) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: content, ContentType: 'image/png' },
  });
  // SHOULD_FIRE: upload-done-no-try-catch — Buffer upload without try-catch
  await upload.done();
}

// 4. upload.done() with catch callback (SHOULD_NOT_FIRE)
async function gt_upload_buffer_safe(bucket: string, key: string, content: Buffer) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: content, ContentType: 'image/png' },
  });
  try {
    // SHOULD_NOT_FIRE: upload.done() inside try-catch
    await upload.done();
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}
