# Sources: @aws-sdk/lib-storage

All behavioral claims in `contract.yaml` are derived from the following sources.

---

## Official AWS Documentation

### SDK v3 lib-storage Package Reference
- **URL:** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-storage/
- **Key claim:** `Upload.done()` returns a Promise that can reject with S3ServiceException
  subclasses or network errors. Documents the Upload class constructor and `.done()` method.

### S3 API Reference — CreateMultipartUpload
- **URL:** https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html
- **Key claim:** Multipart upload initiation can fail with NoSuchBucket, AccessDenied, or
  other S3 errors. Upload.done() orchestrates CreateMultipartUpload → UploadPart × N →
  CompleteMultipartUpload, so any stage can fail.

### S3 API Reference — UploadPart
- **URL:** https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html
- **Key claim:** Individual part uploads can fail with EntityTooLarge, SlowDown (503 retryable),
  or network errors. lib-storage retries internally but will eventually reject if retries
  are exhausted.

### S3 API Reference — CompleteMultipartUpload
- **URL:** https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
- **Key claim:** Completion can fail even after all parts are uploaded (e.g., if the upload
  was aborted externally or the upload ID expired).

### S3 API Reference — AbortMultipartUpload
- **URL:** https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html
- **Relevance:** Explains why upload.abort() must be called on failure — incomplete multipart
  uploads remain in S3 and incur storage costs until explicitly aborted or cleaned up by
  lifecycle rules.

### S3 Error Responses
- **URL:** https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
- **Key claim:** NoSuchBucket, AccessDenied, EntityTooLarge, NoSuchUpload, InvalidPart,
  InvalidPartOrder are all possible errors during multipart upload.

---

## SDK v3 Error Handling Pattern

AWS SDK v3 errors inherit from `ServiceException` (package `@smithy/smithy-client`).
The error code is in `error.name`.

```typescript
try {
  await upload.done();
} catch (err) {
  if (err instanceof Error) {
    switch (err.name) {
      case 'NoSuchBucket':
        // Bucket does not exist — check bucket name
        break;
      case 'AccessDenied':
        // IAM permissions missing for s3:PutObject
        break;
      case 'EntityTooLarge':
        // File exceeds S3 size limits
        break;
      default:
        // Network error, credentials issue, etc.
        break;
    }
  }
  await upload.abort(); // Clean up incomplete multipart upload
  throw err;
}
```

Source: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/error-handling.html

---

## Package Notes

- **`done()` vs `send()`:** Unlike other AWS SDK v3 commands which use `client.send(new XxxCommand())`,
  `@aws-sdk/lib-storage` uses `new Upload({...})` + `await upload.done()`. The method is `done`, NOT `send`.
- **Multipart cost risk:** Incomplete multipart uploads are billed as stored data. Always call
  `upload.abort()` in the catch block or configure an S3 lifecycle rule to auto-abort incomplete uploads.
- **Progress tracking:** `upload.on('httpUploadProgress', cb)` can be registered before calling `.done()`.
- **Part size:** Default minimum part size is 5MB. The `partSize` option in the Upload constructor
  overrides this. Files smaller than `partSize` are uploaded as a single PutObject, not multipart.
