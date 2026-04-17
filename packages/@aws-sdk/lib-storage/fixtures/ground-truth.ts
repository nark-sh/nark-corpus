/**
 * @aws-sdk/lib-storage Ground-Truth Fixture
 * Postcondition IDs:
 *   upload-done-no-try-catch       (Upload.done())
 *   upload-done-already-called     (Upload.done() called twice)
 *   abort-does-not-clean-up-synchronously  (Upload.abort() fire-and-forget)
 *   leave-parts-on-error-prevents-cleanup  (leavePartsOnError: true)
 *   abort-before-done-is-noop      (abort() before done())
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

// 5. upload.done() called twice on same instance (SHOULD_FIRE: upload-done-already-called)
// Note: No direct detection rule exists yet — this is a contract-defined violation.
// The test documents the behavior: calling done() twice throws "already executed .done()"
// @expect-violation: upload-done-already-called
async function gt_upload_done_twice(bucket: string, key: string, body: Readable) {
  const upload = new Upload({ client: s3, params: { Bucket: bucket, Key: key, Body: body } });
  try {
    try {
      await upload.done(); // First call — may succeed or fail
    } catch (firstErr) {
      // WRONG: Retry by calling done() again on same instance
      // NOTE: scanner gap — upload-done-already-called requires tracking that done() was called
      // twice on the same Upload instance. Scanner cannot detect stateful re-use patterns.
      try {
        await upload.done(); // Throws "already executed .done()"
      } catch (secondErr) {
        throw secondErr;
      }
    }
  } catch (err) {
    throw err;
  }
}

// 6. abort() without awaiting done() (fire-and-forget abort) (SHOULD_FIRE: abort-does-not-clean-up-synchronously)
// @expect-violation: abort-does-not-clean-up-synchronously
async function gt_abort_fire_and_forget(bucket: string, key: string, body: Readable) {
  const upload = new Upload({ client: s3, params: { Bucket: bucket, Key: key, Body: body } });
  const donePromise = upload.done(); // Start upload
  // SHOULD_FIRE: abort-does-not-clean-up-synchronously — abort() without awaiting done()
  await upload.abort(); // Signal abort, but never await donePromise — cleanup never confirmed
  // donePromise is abandoned — AbortError and markUploadAsAborted never run
}

// 7. abort() correctly awaited with done() (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_abort_with_done_awaited(bucket: string, key: string, body: Readable) {
  const upload = new Upload({ client: s3, params: { Bucket: bucket, Key: key, Body: body } });
  const donePromise = upload.done();
  await upload.abort();
  try {
    // SHOULD_NOT_FIRE: done() is properly awaited after abort() to allow cleanup
    await donePromise;
  } catch (err: any) {
    if (err.name !== 'AbortError') throw err;
    // Normal cancellation
  }
}

// 8. leavePartsOnError: true without manual cleanup (SHOULD_FIRE: leave-parts-on-error-prevents-cleanup)
// @expect-violation: leave-parts-on-error-prevents-cleanup
async function gt_leave_parts_on_error_no_cleanup(bucket: string, key: string, body: Readable) {
  // NOTE: scanner gap — leave-parts-on-error-prevents-cleanup requires detecting leavePartsOnError: true
  // AND verifying no AbortMultipartUploadCommand is issued in the catch block. Scanner cannot do this.
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: body },
    leavePartsOnError: true,  // Disables automatic cleanup on abort/failure
  });
  try {
    await upload.done();
  } catch (err) {
    // Parts are NOT cleaned up — S3 costs accumulate indefinitely
    // No manual AbortMultipartUploadCommand issued
    throw err;
  }
}

// 9. leavePartsOnError: true WITH manual cleanup (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_leave_parts_on_error_with_cleanup(bucket: string, key: string, body: Readable) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: body },
    leavePartsOnError: true,  // Manual cleanup responsibility
  });
  const uploadId = upload.uploadId;
  try {
    // SHOULD_NOT_FIRE: developer is taking manual responsibility for cleanup
    await upload.done();
  } catch (err) {
    console.error('Upload failed, would manually clean up uploadId:', uploadId);
    throw err;
  }
}
