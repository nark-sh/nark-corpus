/**
 * @aws-sdk/lib-storage Ground-Truth Fixture
 * Postcondition IDs:
 *   upload-done-no-try-catch       (Upload.done())
 *   upload-done-already-called     (Upload.done() called twice)
 *   upload-done-exceeds-max-parts  (Upload.done() with file size requiring >10000 parts)
 *   upload-done-missing-etag-cors  (Upload.done() with bucket CORS missing ETag in ExposeHeaders)
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

// 10. Large file upload (>48.8 GB) WITHOUT partSize tuning — done() will throw "Exceeded 10000 parts"
// @expect-violation: upload-done-exceeds-max-parts
async function gt_upload_exceeds_max_parts(bucket: string, key: string, hugeBody: Readable) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: hugeBody },
    // Default partSize is 5 MB; with files larger than ~48.8 GB this will throw.
  });
  // SHOULD_FIRE: upload-done-exceeds-max-parts — done() without try-catch and no partSize tuning
  await upload.done();
}

// 11. Large file upload with try-catch AND tuned partSize (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_upload_large_file_with_part_size(bucket: string, key: string, hugeBody: Readable, maxBytes: number) {
  // partSize sized to keep total parts under 10,000 even at maxBytes.
  const partSize = Math.max(5 * 1024 * 1024, Math.ceil(maxBytes / 10000));
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: hugeBody },
    partSize,
    queueSize: 4,
  });
  try {
    // SHOULD_NOT_FIRE: try-catch present AND partSize tuned for file size
    await upload.done();
  } catch (err) {
    console.error('Upload failed:', err);
    await upload.abort();
    throw err;
  }
}

// 12. Browser upload to a bucket without ETag in CORS ExposeHeaders — done() will throw "missing ETag"
// @expect-violation: upload-done-missing-etag-cors
async function gt_upload_missing_etag_cors(bucket: string, key: string, fileBlob: Blob) {
  // If the destination bucket's CORS rules omit "ETag" from ExposeHeaders,
  // done() throws "Part N is missing ETag in UploadPart response."
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: fileBlob as unknown as Buffer },
  });
  // SHOULD_FIRE: upload-done-missing-etag-cors — browser upload without try-catch
  await upload.done();
}

// 13. Browser upload with try-catch that explicitly handles the CORS hint (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_upload_handles_etag_cors_error(bucket: string, key: string, fileBlob: Blob) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: fileBlob as unknown as Buffer },
  });
  try {
    // SHOULD_NOT_FIRE: try-catch present
    await upload.done();
  } catch (err: any) {
    if (typeof err?.message === 'string' && err.message.includes('missing ETag')) {
      console.error(
        'S3 bucket CORS configuration is missing "ETag" in ExposeHeaders. ' +
          'Add ETag to the bucket CORS rule and retry.',
      );
    }
    await upload.abort();
    throw err;
  }
}
