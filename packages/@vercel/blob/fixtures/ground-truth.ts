/**
 * @vercel/blob Ground-Truth Fixture
 * Postcondition IDs:
 *   blob-put-no-try-catch                              (put)
 *   blob-del-no-try-catch                              (del)
 *   blob-list-no-try-catch                             (list)
 *   blob-head-no-try-catch                             (head)
 *   blob-head-access-error                             (head)
 *   blob-copy-no-try-catch                             (copy)
 *   blob-copy-source-not-found                         (copy)
 *   blob-get-null-not-checked                          (get)
 *   blob-get-no-try-catch                              (get)
 *   blob-handle-upload-missing-auth-check              (handleUpload)
 *   blob-handle-upload-no-try-catch                    (handleUpload)
 *   blob-create-multipart-no-try-catch                 (createMultipartUpload)
 *   blob-upload-part-no-try-catch                      (uploadPart)
 *   blob-upload-part-minimum-size                      (uploadPart)
 *   blob-complete-multipart-no-try-catch               (completeMultipartUpload)
 *   blob-upload-missing-handle-url                     (upload)
 *   blob-upload-token-fetch-failed                     (upload)
 *   blob-upload-client-token-expired                   (upload)
 *   blob-generate-client-token-browser-env             (generateClientTokenFromReadWriteToken)
 *   blob-generate-client-token-invalid-token           (generateClientTokenFromReadWriteToken)
 *   blob-create-multipart-uploader-no-try-catch        (createMultipartUploader)
 *   blob-create-multipart-uploader-plain-object-body   (createMultipartUploader)
 *   blob-create-folder-no-try-catch                    (createFolder)
 *   blob-issue-signed-token-no-try-catch               (issueSignedToken)
 *   blob-issue-signed-token-valid-until-in-past        (issueSignedToken)
 *   blob-presign-url-no-try-catch                      (presignUrl)
 *   blob-presign-url-delegation-expired                (presignUrl)
 *   blob-handle-upload-presigned-no-try-catch          (handleUploadPresigned)
 *   blob-handle-upload-presigned-missing-webhook-public-key (handleUploadPresigned)
 *   blob-upload-presigned-no-try-catch                 (uploadPresigned)
 */
import { put, del, list, head, copy, get, createMultipartUpload, uploadPart, completeMultipartUpload, createMultipartUploader, createFolder, issueSignedToken, presignUrl } from '@vercel/blob';
import { handleUpload, upload, generateClientTokenFromReadWriteToken, handleUploadPresigned, uploadPresigned, type HandleUploadBody } from '@vercel/blob/client';

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

// ─── upload() (client-side) ───────────────────────────────────────────────────

// 22. upload() without try-catch — token fetch failure (SHOULD_FIRE when scanner detects client upload)
// NOTE: No scanner detector yet for upload() from @vercel/blob/client — concern queued
// @expect-violation: blob-upload-token-fetch-failed
// @expect-violation: blob-upload-client-token-expired
async function gt_upload_no_try_catch(pathname: string, file: File) {
  // SCANNER_GAP: blob-upload-token-fetch-failed — upload() throws BlobError if server
  // handleUpload route returns non-2xx (e.g., auth redirect returns HTML instead of JSON)
  // No scanner rule yet — concern queued for bc-scanner-upgrade
  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  });
  return blob.url;
}

// 23. upload() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_upload_safe(pathname: string, file: File) {
  try {
    // SHOULD_NOT_FIRE: upload() inside try-catch
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    return blob.url;
  } catch (err) {
    console.error('Client upload failed:', err);
    throw err;
  }
}

// ─── generateClientTokenFromReadWriteToken() ─────────────────────────────────

// 24. generateClientTokenFromReadWriteToken() without try-catch (SHOULD_FIRE when scanner detects)
// NOTE: No scanner detector yet for generateClientTokenFromReadWriteToken() — concern queued
// @expect-violation: blob-generate-client-token-invalid-token
async function gt_generate_client_token_no_try_catch(pathname: string) {
  // SCANNER_GAP: blob-generate-client-token-invalid-token — throws BlobError if
  // BLOB_READ_WRITE_TOKEN is missing or malformed (storeId extraction fails)
  // No scanner rule yet — concern queued for bc-scanner-upgrade
  const clientToken = await generateClientTokenFromReadWriteToken({
    pathname,
    onUploadCompleted: {
      callbackUrl: '/api/upload/complete',
    },
  });
  return clientToken;
}

// 25. generateClientTokenFromReadWriteToken() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_generate_client_token_safe(pathname: string) {
  try {
    // SHOULD_NOT_FIRE: generateClientTokenFromReadWriteToken() inside try-catch
    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      onUploadCompleted: {
        callbackUrl: '/api/upload/complete',
      },
    });
    return clientToken;
  } catch (err) {
    console.error('Token generation failed:', err);
    throw err;
  }
}

// ─── createMultipartUploader() ───────────────────────────────────────────────

// 26. createMultipartUploader() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-create-multipart-uploader-no-try-catch
async function gt_create_multipart_uploader_missing(pathname: string, chunks: Buffer[]) {
  // SHOULD_FIRE: blob-create-multipart-uploader-no-try-catch — factory throws on auth/network error
  const uploader = await createMultipartUploader(pathname, { access: 'public' });
  const parts = await Promise.all(chunks.map((chunk, i) => uploader.uploadPart(i + 1, chunk)));
  return await uploader.complete(parts);
}

// 27. createMultipartUploader() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_create_multipart_uploader_safe(pathname: string, chunks: Buffer[]) {
  try {
    // SHOULD_NOT_FIRE: createMultipartUploader() with try-catch
    const uploader = await createMultipartUploader(pathname, { access: 'public' });
    const parts = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const part = await uploader.uploadPart(i + 1, chunks[i]);
        parts.push(part);
      } catch (partErr) {
        console.error(`Part ${i + 1} upload failed:`, partErr);
        throw partErr;
      }
    }
    return await uploader.complete(parts);
  } catch (err) {
    console.error('Multipart upload failed:', err);
    throw err;
  }
}

// ─── createFolder() ──────────────────────────────────────────────────────────

// 28. createFolder() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-create-folder-no-try-catch
async function gt_create_folder_missing(folderPath: string) {
  // SHOULD_FIRE: blob-create-folder-no-try-catch — throws on auth failure or network error
  const folder = await createFolder(folderPath);
  return folder.url;
}

// 29. createFolder() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_create_folder_safe(folderPath: string) {
  try {
    // SHOULD_NOT_FIRE: createFolder() inside try-catch
    const folder = await createFolder(folderPath);
    return folder.url;
  } catch (err) {
    console.error('createFolder failed:', err);
    throw err;
  }
}

// ─── issueSignedToken() ──────────────────────────────────────────────────────

// 30. issueSignedToken() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-issue-signed-token-no-try-catch
async function gt_issue_signed_token_missing(pathname: string) {
  // SHOULD_FIRE: blob-issue-signed-token-no-try-catch
  const token = await issueSignedToken({ pathname, operations: ['put'], validUntil: Date.now() + 3600 * 1000 });
  return token;
}

// 31. issueSignedToken() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_issue_signed_token_safe(pathname: string) {
  try {
    // SHOULD_NOT_FIRE: issueSignedToken() inside try-catch
    const token = await issueSignedToken({ pathname, operations: ['put'], validUntil: Date.now() + 3600 * 1000 });
    return token;
  } catch (err) {
    console.error('issueSignedToken failed:', err);
    throw err;
  }
}

// ─── presignUrl() ────────────────────────────────────────────────────────────

// 32. presignUrl() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-presign-url-no-try-catch
async function gt_presign_url_missing(
  signedToken: { clientSigningToken: string; delegationToken: string },
  pathname: string
) {
  // SHOULD_FIRE: blob-presign-url-no-try-catch
  const result = await presignUrl(signedToken, { operation: 'put', pathname, access: 'public' });
  return result.presignedUrl;
}

// 33. presignUrl() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_presign_url_safe(
  signedToken: { clientSigningToken: string; delegationToken: string },
  pathname: string
) {
  try {
    // SHOULD_NOT_FIRE: presignUrl() inside try-catch
    const result = await presignUrl(signedToken, { operation: 'put', pathname, access: 'public' });
    return result.presignedUrl;
  } catch (err) {
    console.error('presignUrl failed:', err);
    throw err;
  }
}

// ─── handleUploadPresigned() ─────────────────────────────────────────────────

// 34. handleUploadPresigned() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-handle-upload-presigned-no-try-catch
async function gt_handle_upload_presigned_missing(request: Request, body: any) {
  // SHOULD_FIRE: blob-handle-upload-presigned-no-try-catch
  const result = await handleUploadPresigned({
    request,
    body,
    getSignedToken: async (_p, _cp, _m) => ({
      token: await issueSignedToken({ pathname: '*', operations: ['put'], validUntil: Date.now() + 3600 * 1000 }),
    }),
  });
  return result;
}

// 35. handleUploadPresigned() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_handle_upload_presigned_safe(request: Request, body: any) {
  try {
    // SHOULD_NOT_FIRE: handleUploadPresigned() inside try-catch
    const result = await handleUploadPresigned({
      request,
      body,
      getSignedToken: async (_p, _cp, _m) => ({
        token: await issueSignedToken({ pathname: '*', operations: ['put'], validUntil: Date.now() + 3600 * 1000 }),
      }),
    });
    return result;
  } catch (err) {
    console.error('handleUploadPresigned failed:', err);
    throw err;
  }
}

// ─── uploadPresigned() ───────────────────────────────────────────────────────

// 36. uploadPresigned() without try-catch (SHOULD_FIRE)
// @expect-violation: blob-upload-presigned-no-try-catch
async function gt_upload_presigned_missing(pathname: string, body: Buffer) {
  // SHOULD_FIRE: blob-upload-presigned-no-try-catch
  const blob = await uploadPresigned(pathname, body, { access: 'public', handleUploadUrl: '/api/upload-presigned' });
  return blob.url;
}

// 37. uploadPresigned() with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_upload_presigned_safe(pathname: string, body: Buffer) {
  try {
    // SHOULD_NOT_FIRE: uploadPresigned() inside try-catch
    const blob = await uploadPresigned(pathname, body, { access: 'public', handleUploadUrl: '/api/upload-presigned' });
    return blob.url;
  } catch (err) {
    console.error('uploadPresigned failed:', err);
    throw err;
  }
}
