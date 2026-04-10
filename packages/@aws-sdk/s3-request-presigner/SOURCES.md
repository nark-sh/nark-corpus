# Sources — @aws-sdk/s3-request-presigner

## Official Documentation

- **Package Reference:** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-s3-request-presigner/
- **S3 Client Reference (errors):** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
- **AWS Blog — Generate Presigned URL:** https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
- **S3 Error Responses:** https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html

## Behavioral Claims

### getSignedUrl throws on credential failure

Source: AWS SDK v3 credential provider chain documentation.
Both `getSignedUrl` and `createPresignedPost` call the credential provider chain internally
before signing. If no credentials are found, a `CredentialsProviderError` is thrown.

Common real-world failure scenarios:
1. Vercel deployment missing `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars
2. Local dev without `~/.aws/credentials` configured
3. STS temporary credentials expired mid-session
4. IAM role not attached in non-AWS serverless environments

### createPresignedPost has identical error surface

Same credential resolution path as `getSignedUrl`. Both functions use the S3 presigner
utility from `@smithy/signature-v4` under the hood.

## npm Package

- https://www.npmjs.com/package/@aws-sdk/s3-request-presigner
- Weekly downloads: ~4M (as of 2026-Q1)
- Part of the `@aws-sdk` monorepo: https://github.com/aws/aws-sdk-js-v3

## Evidence Quality: partial

The `partial` rating reflects that:
- The error surface is real and documented in SDK source code
- Official AWS documentation examples often omit try-catch (reducing citable examples)
- Behavioral claims are confirmed by common production failure patterns
- No official AWS error handling guide specifically addresses presigner failures
