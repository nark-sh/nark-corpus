/**
 * @vercel/blob Ground-Truth Fixture
 * Postcondition IDs:
 *   blob-put-no-try-catch                 (put)
 *   blob-del-no-try-catch                 (del)
 *   blob-list-no-try-catch                (list)
 *   blob-head-no-try-catch                (head)
 *   blob-head-access-error                (head)
 *   blob-copy-no-try-catch                (copy)
 *   blob-copy-source-not-found            (copy)
 *   blob-get-null-not-checked             (get)
 *   blob-get-no-try-catch                 (get)
 *   blob-handle-upload-missing-auth-check (handleUpload)
 *   blob-handle-upload-no-try-catch       (handleUpload)
 *   blob-create-multipart-no-try-catch    (createMultipartUpload)
 *   blob-upload-part-no-try-catch         (uploadPart)
 *   blob-upload-part-minimum-size         (uploadPart)
 *   blob-complete-multipart-no-try-catch  (completeMultipartUpload)
 */
import { put, del, list, head, copy, get, createMultipartUpload, uploadPart, completeMultipartUpload } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

// 1. put() without try-catch (SHOULD_FIRE)
async function gt_put_missing(path: string, content: Buffer) {
  // SHOULD_FIRE: blob-put-no-try-catch — put() without try-catch
  const blob = await put(path, content, { access: 'public' });
  return blob.url;
}

// 2. put() with try-catch (SHOULD_NOT_FIRE)
async function gt_put_safe(path: string, content: Buffer) {
  try {
    // SHOULD_NOT_FIRE: put() inside try-catch
    const blob = await put(path, content, { access: 'public' });
    return blob.url;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}

// 3. del() without try-catch (SHOULD_FIRE)
async function gt_del_missing(url: string) {
  // SHOULD_FIRE: blob-del-no-try-catch — del() without try-catch
  await del(url);
}

// 4. del() with try-catch (SHOULD_NOT_FIRE)
async function gt_del_safe(url: string) {
  try {
    // SHOULD_NOT_FIRE: del() inside try-catch
    await del(url);
  } catch (err) {
    console.error('Delete failed:', err);
    throw err;
  }
}

// 5. list() without try-catch (SHOULD_FIRE)
async function gt_list_missing(prefix: string) {
  // SHOULD_FIRE: blob-list-no-try-catch — list() without try-catch
  const { blobs } = await list({ prefix });
  return blobs;
}

// 6. list() with try-catch (SHOULD_NOT_FIRE)
async function gt_list_safe(prefix: string) {
  try {
    // SHOULD_NOT_FIRE: list() inside try-catch
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (err) {
    console.error('List failed:', err);
    throw err;
  }
}

// ─── head() ──────────────────────────────────────────────────────────────────

// 7. head() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-head-no-try-catch
async function gt_head_missing(blobUrl: string) {
  // SHOULD_FIRE: blob-head-no-try-catch — head() throws BlobNotFoundError on 404, must be wrapped
  const metadata = await head(blobUrl);
  return metadata.size;
}

// 8. head() with try-catch (SHOULD_NOT_FIRE)
async function gt_head_safe(blobUrl: string) {
  try {
    // SHOULD_NOT_FIRE: head() inside try-catch
    const metadata = await head(blobUrl);
    return metadata.size;
  } catch (err) {
    console.error('head() failed:', err);
    return null;
  }
}

// ─── copy() ──────────────────────────────────────────────────────────────────

// 9. copy() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-copy-no-try-catch
async function gt_copy_missing(sourceUrl: string, destPath: string) {
  // SHOULD_FIRE: blob-copy-no-try-catch — copy() throws on source not found, auth failure, etc.
  const result = await copy(sourceUrl, destPath, { access: 'public' });
  return result.url;
}

// 10. copy() with try-catch (SHOULD_NOT_FIRE)
async function gt_copy_safe(sourceUrl: string, destPath: string) {
  try {
    // SHOULD_NOT_FIRE: copy() inside try-catch
    const result = await copy(sourceUrl, destPath, { access: 'public' });
    return result.url;
  } catch (err) {
    console.error('copy() failed:', err);
    throw err;
  }
}

// ─── get() ───────────────────────────────────────────────────────────────────

// 11. get() without null check (SHOULD_FIRE)
// @expect-violation: blob-get-null-not-checked
async function gt_get_null_not_checked(blobUrl: string) {
  // SHOULD_NOT_FIRE: scanner gap — blob-get-null-not-checked — get() returns null on 404, accessing .stream without null check
  const result = await get(blobUrl, { access: 'private' });
  // Missing: if (!result) return null;
  return result!.stream; // This crashes if result is null
}

// 12. get() with null check (SHOULD_NOT_FIRE)
async function gt_get_with_null_check(blobUrl: string) {
  try {
    // SHOULD_NOT_FIRE: get() with null check and try-catch
    const result = await get(blobUrl, { access: 'private' });
    if (!result) return null;
    return result.stream;
  } catch (err) {
    console.error('get() failed:', err);
    throw err;
  }
}

// 13. get() without try-catch (throws on auth error, rate limit) (SHOULD_FIRE)
// @expect-violation: blob-get-no-try-catch
async function gt_get_no_try_catch(blobUrl: string) {
  // SHOULD_NOT_FIRE: scanner gap — blob-get-no-try-catch — get() throws on auth failure / rate limiting
  const result = await get(blobUrl, { access: 'private' });
  if (!result) return null;
  return result.stream;
}

// ─── handleUpload() ──────────────────────────────────────────────────────────

// 14. handleUpload() without auth check in onBeforeGenerateToken (SHOULD_FIRE)
// @expect-violation: blob-handle-upload-missing-auth-check
async function gt_handle_upload_no_auth(request: Request, body: HandleUploadBody) {
  // SHOULD_NOT_FIRE: scanner gap — blob-handle-upload-missing-auth-check — no auth check in onBeforeGenerateToken
  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Missing: auth check here — any anonymous user can upload
        return {
          allowedContentTypes: ['image/jpeg', 'image/png'],
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
}

// 15. handleUpload() with auth check (SHOULD_NOT_FIRE)
async function gt_handle_upload_with_auth(request: Request, body: HandleUploadBody, session: { userId: string } | null) {
  try {
    // SHOULD_NOT_FIRE: handleUpload() with auth check in onBeforeGenerateToken
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!session) {
          throw new Error('Unauthorized');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png'],
          tokenPayload: JSON.stringify({ userId: session.userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
}

// ─── createMultipartUpload() ─────────────────────────────────────────────────

// 16. createMultipartUpload() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-create-multipart-no-try-catch
async function gt_create_multipart_missing(pathname: string) {
  // SHOULD_FIRE: blob-create-multipart-no-try-catch — throws on auth/network failure
  const { key, uploadId } = await createMultipartUpload(pathname, { access: 'public' });
  return { key, uploadId };
}

// 17. createMultipartUpload() with try-catch (SHOULD_NOT_FIRE)
async function gt_create_multipart_safe(pathname: string) {
  try {
    // SHOULD_NOT_FIRE: createMultipartUpload() inside try-catch
    const { key, uploadId } = await createMultipartUpload(pathname, { access: 'public' });
    return { key, uploadId };
  } catch (err) {
    console.error('createMultipartUpload failed:', err);
    throw err;
  }
}

// ─── uploadPart() ────────────────────────────────────────────────────────────

// 18. uploadPart() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-upload-part-no-try-catch
async function gt_upload_part_missing(pathname: string, chunk: Buffer, key: string, uploadId: string, partNumber: number) {
  // SHOULD_FIRE: blob-upload-part-no-try-catch — throws on network failure, auth error, size violation
  const part = await uploadPart(pathname, chunk, { access: 'public', key, uploadId, partNumber });
  return part;
}

// 19. uploadPart() with try-catch (SHOULD_NOT_FIRE)
async function gt_upload_part_safe(pathname: string, chunk: Buffer, key: string, uploadId: string, partNumber: number) {
  try {
    // SHOULD_NOT_FIRE: uploadPart() inside try-catch
    const part = await uploadPart(pathname, chunk, { access: 'public', key, uploadId, partNumber });
    return part;
  } catch (err) {
    console.error(`Part ${partNumber} upload failed:`, err);
    throw err;
  }
}

// ─── completeMultipartUpload() ───────────────────────────────────────────────

// 20. completeMultipartUpload() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-complete-multipart-no-try-catch
async function gt_complete_multipart_missing(pathname: string, parts: Array<{etag: string; partNumber: number}>, key: string, uploadId: string) {
  // SHOULD_FIRE: blob-complete-multipart-no-try-catch — throws if parts are invalid or network fails
  const blob = await completeMultipartUpload(pathname, parts, { access: 'public', key, uploadId });
  return blob.url;
}

// 21. completeMultipartUpload() with try-catch (SHOULD_NOT_FIRE)
async function gt_complete_multipart_safe(pathname: string, parts: Array<{etag: string; partNumber: number}>, key: string, uploadId: string) {
  try {
    // SHOULD_NOT_FIRE: completeMultipartUpload() inside try-catch
    const blob = await completeMultipartUpload(pathname, parts, { access: 'public', key, uploadId });
    return blob.url;
  } catch (err) {
    console.error('completeMultipartUpload failed:', err);
    throw err;
  }
}
