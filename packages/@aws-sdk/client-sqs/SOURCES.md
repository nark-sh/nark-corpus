# Sources: @aws-sdk/client-sqs

## Official Documentation

- **SDK v3 SQS Client Reference**
  https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sqs/
  Complete API reference for SQSClient and all command classes.

- **SendMessage API Reference**
  https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
  Error codes: QueueDoesNotExist, InvalidMessageContents, MessageTooLong, RequestThrottled.

- **ReceiveMessage API Reference**
  https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html
  Error codes: OverLimit, QueueDoesNotExist, RequestThrottled.

- **DeleteMessage API Reference**
  https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessage.html
  Error codes: ReceiptHandleIsInvalid, QueueDoesNotExist, InvalidIdFormat.

- **AWS SDK v3 Error Handling Blog**
  https://aws.amazon.com/blogs/developer/service-error-handling-modular-aws-sdk-js/
  Official guidance on catching SQSServiceException subclasses.

- **SQS Best Practices**
  https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-best-practices.html
  Performance and reliability best practices, error handling guidance.

- **SQS JavaScript SDK v3 Examples**
  https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_sqs_code_examples.html
  Official AWS code examples.

## Real-World Evidence

### Backstage (GitHub: backstage/backstage, ~28k stars)
**File:** `plugins/events-backend-module-aws-sqs/src/publisher/AwsSqsConsumingEventPublisher.ts`
**Pattern:** Correct — all `send()` calls wrapped in try-catch with structured error logging.
**Evidence quality:** partial (correct usage, demonstrates the expected pattern)

### Version Distribution (from test-repos/)
| Repo | Version declared |
|------|-----------------|
| backstage | `^3.350.0` |
| trigger.dev | `^3.445.0` |
