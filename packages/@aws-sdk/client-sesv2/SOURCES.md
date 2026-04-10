# Sources: @aws-sdk/client-sesv2

## Why SESv2Client.send() Requires Error Handling

### Official AWS Documentation

- **SDK v3 SESv2 Client**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sesv2/
- **SendEmail API Reference**: https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html
- **SES v2 Error Codes**: https://docs.aws.amazon.com/ses/latest/APIReference-V2/CommonErrors.html
- **Sandbox Mode**: https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html

### Key Behavioral Differences from SES v1

SESv2 is a distinct API from SES v1 with different:
- **Parameter names**: `FromEmailAddress` (not `Source`), `Content.Simple` (not `Message`)
- **SDK classes**: `SESv2Client` and `SESv2ServiceException` (not `SESClient`/`SESServiceException`)
- **Import path**: `@aws-sdk/client-sesv2` (separate npm package)
- **Error codes**: `SendingQuotaExceededException` (not `LimitExceededException`)

### Error Conditions That Require Handling

1. **Sandbox restrictions** (most common in development): New AWS accounts are placed in sandbox
   mode where only verified email addresses can receive emails. Any send to an unverified
   recipient throws immediately.

2. **Sending quota exceeded** (`SendingQuotaExceededException`): AWS enforces per-second and
   per-day sending limits. SaaS apps sending transactional email at scale will hit these.

3. **Unverified sending identity** (`NotFoundException`): The `FromEmailAddress` domain or address
   must be verified in SES. Misconfigured production environments will fail here.

4. **Message rejected** (`MessageRejected`): Content detected as spam or policy violation.

5. **Account suspended** (`AccountSuspendedException`): Account-level suspension (e.g., high
   bounce rates triggering AWS enforcement action).

6. **Throttling** (`TooManyRequestsException`): Request rate exceeded — retryable with backoff.

7. **Network failures**: Standard network-layer failures (timeout, DNS, connection reset).

### Evidence of Runtime Failures

These errors are not theoretical — they are the most common SES-related support questions:
- Sandbox mode blocks emails silently without try-catch
- Sending quota exhaustion causes partial email delivery in bulk campaigns
- Identity verification failures are common when deploying to new AWS accounts/regions

### Contract Scope

This contract covers `SESv2Client.send()` as the single entry point for all SESv2 API calls.
All operations (email sending, identity management, contact management) go through this method.
