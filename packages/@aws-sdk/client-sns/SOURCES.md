# Sources — @aws-sdk/client-sns

## Primary Documentation

**AWS SNS JavaScript SDK v3**
https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sns/
Official SDK reference. Lists all commands (PublishCommand, CreateTopicCommand, etc.) and
documents that client.send() returns a Promise that rejects on service errors.

**SNS Publish API Reference**
https://docs.aws.amazon.com/sns/latest/api/API_Publish.html
Documents all error codes thrown by Publish: AuthorizationErrorException, EndpointDisabledException,
InvalidParameterException, KMSAccessDeniedException, KMSDisabledException, KMSInvalidStateException,
KMSNotFoundException, KMSOptInRequired, NotFound, PlatformApplicationDisabled, ThrottledException.

**SNS Error Handling — AWS Developer Blog**
https://aws.amazon.com/blogs/developer/service-error-handling-modular-aws-sdk-js/
Explains how SNSServiceException and its subclasses are thrown. error.name contains the AWS error code.

**SNS Dead Letter Queues**
https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html
Covers delivery failure scenarios. SNS throws when message delivery fails during send.

**SNS Publish Batch API**
https://docs.aws.amazon.com/sns/latest/api/API_PublishBatch.html
Documents partial failure pattern — HTTP 200 with Failed array. Client.send() still throws
for auth/network errors; partial failures require inspecting result.Failed.

## Error Evidence

The following specific errors are documented as thrown by SNS operations:
- `NotFound` — Topic ARN does not exist
- `AuthorizationErrorException` — Caller lacks permission to publish to topic
- `InvalidParameterException` — Invalid message, subject, or attribute
- `ThrottledException` — Rate limit exceeded
- `EndpointDisabledException` — Mobile push endpoint is disabled
- `KMSDisabledException` — KMS key for server-side encryption is disabled
- `KMSNotFoundException` — KMS key not found
- `PlatformApplicationDisabled` — Mobile platform application disabled

## Real-World Usage Evidence

- `test-repos/nestjs-rest-cqrs-example` — SNSClient with publish() calling send() without try-catch
- `test-repos/wing` — SNSClient.send() in publish() method (proper handling with try-catch)
- Corpus DB: 6 repos with @aws-sdk/client-sns as runtime dependency (faastjs, skiff-apps, etc.)
