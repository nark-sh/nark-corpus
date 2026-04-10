# Sources: @google-cloud/storage

## Official Documentation

### API Reference
- **Google Cloud Storage Node.js Client API**: [googleapis.dev/nodejs/storage/latest/](https://googleapis.dev/nodejs/storage/latest/)
  - Complete class and method documentation
  - Error types: ApiError, PartialFailureError
  - All async methods throw errors on failures

- **Storage Class Reference**: [googleapis.dev/nodejs/storage/latest/Storage.html](https://googleapis.dev/nodejs/storage/latest/Storage.html)
  - createBucket(), getBuckets(), createHmacKey() methods
  - All throw ApiError on network/auth failures

- **Bucket Class Reference**: [googleapis.dev/nodejs/storage/latest/Bucket.html](https://googleapis.dev/nodejs/storage/latest/Bucket.html)
  - upload(), delete(), deleteFiles(), getFiles() methods
  - Batch operations throw PartialFailureError

- **File Class Reference**: [googleapis.dev/nodejs/storage/latest/File.html](https://googleapis.dev/nodejs/storage/latest/File.html)
  - download(), save(), delete(), copy() methods
  - Streams (createReadStream/createWriteStream) emit error events
  - 404 errors when file doesn't exist

- **TransferManager Class Reference**: [googleapis.dev/nodejs/storage/latest/TransferManager.html](https://googleapis.dev/nodejs/storage/latest/TransferManager.html)
  - downloadManyFiles(), uploadManyFiles() for batch operations
  - Throws PartialFailureError for partial failures

### Error Handling & Retry Strategy
- **Retry Strategy Guide**: [docs.cloud.google.com/storage/docs/retry-strategy](https://docs.cloud.google.com/storage/docs/retry-strategy)
  - Automatic retry for HTTP 408, 429, 500, 502, 503, 504
  - Exponential backoff configuration
  - Idempotent vs non-idempotent operations
  - Default: 3 retries, 600s timeout, 2x multiplier

- **Configure Retries Sample**: [docs.cloud.google.com/storage/docs/samples/storage-configure-retries](https://docs.cloud.google.com/storage/docs/samples/storage-configure-retries)
  - Full Node.js example with retry configuration
  - Parameters: autoRetry, retryDelayMultiplier, totalTimeout, maxRetryDelay, maxRetries
  - IdempotencyStrategy options

### Best Practices
- **Cloud Storage Best Practices**: [docs.cloud.google.com/storage/docs/best-practices](https://docs.cloud.google.com/storage/docs/best-practices)
  - Error handling recommendations
  - Retry strategies
  - Performance optimization

### HTTP Status Codes
- **HTTP Status and Error Codes**: [cloud.google.com/storage/docs/json_api/v1/status-codes](https://cloud.google.com/storage/docs/json_api/v1/status-codes)
  - Complete list of HTTP status codes
  - 4xx client errors (401, 403, 404, 408, 429)
  - 5xx server errors (500, 502, 503, 504)
  - Error response format

- **API Error Class**: [cloud.google.com/nodejs/docs/reference/storage/7.2.0/storage/apierror](https://cloud.google.com/nodejs/docs/reference/storage/7.2.0/storage/apierror)
  - ApiError constructor and properties
  - Error message structure

## npm Package
- **@google-cloud/storage on npm**: [npmjs.com/package/@google-cloud/storage](https://www.npmjs.com/package/@google-cloud/storage)
  - Current version: 7.x (latest)
  - Stable since v5.0.0
  - Weekly downloads: 2M+

## GitHub Repository & Issues
- **GitHub Repository**: [github.com/googleapis/nodejs-storage](https://github.com/googleapis/nodejs-storage)
  - Official Google Cloud Node.js client
  - Active maintenance and support

- **Error Message Issues**: [github.com/googleapis/nodejs-storage/issues/170](https://github.com/googleapis/nodejs-storage/issues/170)
  - Discussion of error messages in Node.js console
  - ApiError: "Error during request" patterns

- **CONTENT_DOWNLOAD_MISMATCH Error**: [github.com/googleapis/nodejs-storage/issues/709](https://github.com/googleapis/nodejs-storage/issues/709)
  - Download corruption detection
  - Retry recommendation when mismatch occurs

- **Upload 404 Errors**: [github.com/googleapis/nodejs-storage/issues/813](https://github.com/googleapis/nodejs-storage/issues/813)
  - bucket.upload() 404 error patterns
  - Debugging permission and bucket existence

- **Socket Errors (ECONNRESET)**: [github.com/googleapis/nodejs-storage/issues/2482](https://github.com/googleapis/nodejs-storage/issues/2482)
  - Socket errors should be thrown directly
  - Methods that perform fetch operations throw connection errors

- **High Load Errors (408)**: [github.com/googleapis/nodejs-storage/issues/833](https://github.com/googleapis/nodejs-storage/issues/833)
  - 408 Request Timeout under high load
  - Automatic retry mechanism

## Error Handling Patterns

### Error Types
1. **ApiError** - Primary error class for all API failures
   - Network errors (ECONNRESET, ETIMEDOUT)
   - HTTP errors (404, 408, 429, 5xx)
   - Authentication errors (401)
   - Permission errors (403)

2. **PartialFailureError** - Batch operation partial failures
   - deleteFiles() when some deletions fail
   - downloadManyFiles() / uploadManyFiles()
   - Contains details of which operations failed

3. **Network Errors**
   - ECONNRESET: Connection reset by peer
   - ETIMEDOUT: Operation timeout
   - EAI_AGAIN: DNS lookup errors

4. **Special Errors**
   - CONTENT_DOWNLOAD_MISMATCH: Download corruption detected
   - Stream 'error' events from createReadStream/createWriteStream

### Automatically Retried
The client library automatically retries these conditions:
- HTTP 408, 429, 500, 502, 503, 504
- Network connection errors
- DNS lookup failures
- Uses exponential backoff (default: 3 retries, 2x multiplier, max 64s delay)

### Require Manual Handling
These errors are NOT automatically retried:
- 401 Unauthorized (invalid credentials)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (resource doesn't exist)
- Invalid configuration errors

## Contract Rationale

All async operations in @google-cloud/storage can fail due to:
- **Network issues**: Connection timeouts, resets, DNS failures
- **Authentication**: Invalid or expired credentials
- **Authorization**: Insufficient IAM permissions
- **Resource issues**: Bucket/file doesn't exist (404)
- **Rate limiting**: Too many requests (429)
- **Server errors**: Google Cloud internal errors (5xx)

The library throws exceptions for all failures. Unhandled exceptions will crash Node.js applications.

Stream operations (createReadStream, createWriteStream) emit 'error' events instead of throwing, requiring event handlers to prevent process crashes.

## Minimum Safe Version

**>=5.0.0**
- Stable API with comprehensive error handling
- Full retry mechanism with exponential backoff
- ApiError and PartialFailureError error classes
- Configurable retry options

## Research Date

**2026-02-27**
