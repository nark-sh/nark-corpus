# Sources — @aws-sdk/client-secrets-manager

## Primary Documentation

- **AWS SDK v3 Secrets Manager Client**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/
- **GetSecretValue API**: https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
- **Secrets Manager Troubleshooting**: https://docs.aws.amazon.com/secretsmanager/latest/userguide/troubleshoot.html
- **AWS SDK v3 Error Handling**: https://aws.amazon.com/blogs/developer/service-error-handling-modular-aws-sdk-js/

## Error Hierarchy

`SecretsManagerServiceException` is the base class for all service errors.
Thrown from `client.send()` for any service-level failure.

### Common Error Codes (error.name)

| Error | Cause |
|-------|-------|
| `ResourceNotFoundException` | Secret does not exist or was deleted |
| `ResourceExistsException` | Creating a secret that already exists |
| `InvalidRequestException` | Operation not valid in current state (e.g., already scheduled for deletion) |
| `InvalidParameterException` | Malformed request parameter |
| `AccessDeniedException` | IAM permissions insufficient |
| `DecryptionFailure` | KMS key cannot decrypt the secret |
| `EncryptionFailure` | KMS key cannot encrypt the secret |
| `ThrottlingException` | Request rate exceeds limit — retryable |
| `InternalServiceError` | AWS-side error — retryable |

## Why error handling is required

1. **GetSecretValueCommand**: If the secret does not exist or IAM permissions
   are missing, the application crashes at startup or returns uninitialized
   credentials — silently or with an uncaught rejection.

2. **CreateSecretCommand / UpdateSecretCommand**: If the operation fails,
   secrets are not persisted. Applications may continue operating with
   stale or missing credentials.

3. **RotateSecretCommand**: Rotation happens asynchronously. Without error
   handling, failed rotation attempts are silently ignored.

## Evidence

- Real-world TPs found in n8n (testing/containers/services/localstack.ts):
  `createSecret()` and `getSecret()` call `client.send()` without try-catch
- Wing SDK platform.ts wraps all Secrets Manager calls in try-catch (correct usage)
