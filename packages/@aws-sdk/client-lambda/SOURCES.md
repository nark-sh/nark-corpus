# Sources — @aws-sdk/client-lambda

## Primary Documentation

- **AWS SDK v3 Lambda Client**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/lambda/
- **Invoke API**: https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html
- **Lambda Troubleshooting**: https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html
- **AWS SDK v3 Error Handling**: https://aws.amazon.com/blogs/developer/service-error-handling-modular-aws-sdk-js/

## Error Hierarchy

`LambdaServiceException` is the base class for all service errors.
Thrown from `client.send()` for any service-level failure.

### Common Error Codes (error.name)

| Error | Cause |
|-------|-------|
| `ResourceNotFoundException` | Function does not exist |
| `TooManyRequestsException` | Concurrency/rate limit exceeded — retryable |
| `EC2ThrottledException` | EC2 throttling during VPC function scaling — retryable |
| `EC2UnexpectedException` | Unexpected EC2 error |
| `EC2AccessDeniedException` | IAM role lacks EC2 permissions |
| `KMSDisabledException` | KMS key disabled |
| `KMSNotFoundException` | KMS key not found |
| `EniLimitReachedException` | ENI limit for VPC function |
| `RequestTooLargeException` | Payload exceeds 6MB (sync) or 256KB (async) |
| `CodeStorageExceededException` | Deployment package storage limit |
| `ServiceException` | Internal Lambda service error — retryable |

## Lambda-Specific Behavior

**InvokeCommand** does NOT throw for application errors within the invoked function.
Instead, it returns a response with non-null `FunctionError` field. The contract
covers only thrown exceptions (network/service failures), not `FunctionError`.

**Async invocation** (`InvocationType: 'Event'`) returns StatusCode 202 on success.
The `FunctionError` field is not set for async invocations — failures are handled
by Lambda's DLQ or EventSourceMapping configuration.

## Evidence

- Real-world TPs found in wing/winglang/sdk:
  - src/shared-aws/function.inflight.ts: 3 violations
    - `invoke()` line 51: `await this.lambdaClient.send(command)` — no try-catch
    - `invokeAsync()` line 65: `await this.lambdaClient.send(command)` — no try-catch
    - `invokeWithLogs()` line 86: `await this.lambdaClient.send(command)` — no try-catch
- wing repo has 5,376+ stars
