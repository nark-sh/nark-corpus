# Sources for @aws-sdk/client-s3 Behavioral Contract

## Official Documentation

### AWS SDK for JavaScript v3 - S3 Client
- **URL:** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
- **Relevance:** Primary API reference for S3Client and command patterns
- **Key Points:**
  - All S3 operations use command pattern: `client.send(new Command(params))`
  - Common errors: NoSuchKey, AccessDenied, NoSuchBucket
  - Multipart uploads require cleanup on failure

### Error Handling Best Practices
- **URL:** https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/error-handling.html
- **Relevance:** SDK error handling patterns
- **Key Points:**
  - Service errors are thrown exceptions
  - Check `error.$metadata` for request details
  - Retry logic for transient failures

### S3 Multipart Upload
- **URL:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
- **Relevance:** Multipart upload lifecycle and cleanup requirements
- **Key Points:**
  - Must abort incomplete uploads to avoid storage charges
  - UploadPart failures should trigger AbortMultipartUpload

## Common Error Scenarios

### NoSuchKey (404)
- Occurs when object doesn't exist
- Should be handled explicitly in application logic

### NoSuchBucket (404)
- Bucket doesn't exist or incorrect region
- Critical error requiring bucket creation

### AccessDenied (403)
- Insufficient IAM permissions
- Should be logged and surfaced to user

### Network Errors
- Connection timeouts, DNS failures
- Should implement retry logic with exponential backoff

## Severity Rationale

### ERROR Level
- **Object Operations:** Data loss or corruption if errors not handled
- **Multipart Uploads:** Resource leaks without proper cleanup
- **Bucket Operations:** Infrastructure state inconsistencies

### WARNING Level
- **List Operations:** Less critical, pagination handles most edge cases
- Generally safe to fail without corrupting state
