# Sources: @aws-sdk/client-ses

All behavioral claims in `contract.yaml` are derived from the following sources.

---

## Official AWS Documentation

### SDK v3 SES Client Reference
- **URL:** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ses/
- **Relevance:** Authoritative API reference for SESClient, lists all commands and their parameters.

### SES API Reference — SendEmail
- **URL:** https://docs.aws.amazon.com/ses/latest/APIReference/API_SendEmail.html
- **Key claim:** Documents `MessageRejected`, `MailFromDomainNotVerifiedException`, `ConfigurationSetDoesNotExist`, and other error responses for SendEmailCommand.

### SES API Reference — SendRawEmail
- **URL:** https://docs.aws.amazon.com/ses/latest/APIReference/API_SendRawEmail.html
- **Key claim:** Same error set as SendEmail. Additional risk: raw MIME parsing errors.

### SES API Reference — SendTemplatedEmail
- **URL:** https://docs.aws.amazon.com/ses/latest/APIReference/API_SendTemplatedEmail.html
- **Key claim:** Can throw `TemplateDoesNotExist` in addition to the standard set. Template rendering failures are silently discarded unless SNS event notifications are configured.

### SES API Reference — SendBulkTemplatedEmail
- **URL:** https://docs.aws.amazon.com/ses/latest/APIReference/API_SendBulkTemplatedEmail.html
- **Key claim:** Returns per-destination Status in response body (does not throw on partial failure). Overall request-level errors still throw.

### SES Common Errors
- **URL:** https://docs.aws.amazon.com/ses/latest/APIReference/CommonErrors.html
- **Key claim:** `ThrottlingException`, `ServiceUnavailable`, `InternalFailure` are retryable errors returned by all SES operations.

### SES Developer Guide — Error Handling
- **URL:** https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-deliverability.html
- **Relevance:** Describes MessageRejected, bounce, and complaint handling in the context of deliverability.

---

## SDK v3 Error Handling Pattern

AWS SDK v3 errors inherit from `ServiceException` (package `@smithy/smithy-client`).
The error code / type is in `error.name` (not `error.code` as in SDK v2).

```typescript
try {
  await sesClient.send(new SendEmailCommand(params));
} catch (err) {
  if (err instanceof Error) {
    switch (err.name) {
      case 'MessageRejected':
        // Permanent failure — do not retry
        break;
      case 'ThrottlingException':
      case 'LimitExceededException':
        // Retryable — use exponential backoff
        break;
      case 'AccountSendingPausedException':
        // Operational — alert on-call
        break;
    }
  }
}
```

Source: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/error-handling.html

---

## Real-World Evidence

### nocodb (16k+ stars)
- **File:** `packages/nocodb/src/plugins/ses/SES.ts`
- **Pattern:** nodemailer transport (`SES as SESClient` alias). Indirect usage through nodemailer wrapper.
- **Observation:** Error handling is delegated to nodemailer callback (`if (err) console.log(err)`). Silent on send failure if callback not checked.

### documenso (uses @aws-sdk/client-sesv2 for domain management)
- **Note:** Modern SaaS apps are migrating to `@aws-sdk/client-sesv2`. This v1 contract covers existing codebases.

---

## Package Notes

- **SES v1 vs v2:** `@aws-sdk/client-ses` wraps the Amazon SES v1 API. `@aws-sdk/client-sesv2` wraps the SES v2 API with additional features (contact lists, virtual deliverability manager). For new projects, AWS recommends SES v2. This contract covers the v1 client.
- **SDK v3 command pattern:** Unlike SDK v2 (where methods like `ses.sendEmail()` were on the service object directly), SDK v3 requires `sesClient.send(new SendEmailCommand({}))`. This contract covers the SDK v3 pattern.
- **Aggregate `SES` class:** `@aws-sdk/client-ses` also exports an aggregate `SES` class with all commands as direct methods (e.g., `ses.sendEmail()`). This provides SDK v2-like ergonomics. This contract currently covers only the `SESClient.send()` pattern. The `SES.sendEmail()` pattern would require a separate function contract.
