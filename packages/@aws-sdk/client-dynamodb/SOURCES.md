# Sources — @aws-sdk/client-dynamodb

## Primary Documentation

| URL | Description |
|-----|-------------|
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/ | AWS SDK v3 DynamoDB client overview, all commands, error types |
| https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html | Error handling guide: retries, exponential backoff, error codes |
| https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Transaction.html | TransactionCanceledException, CancellationReasons, retry patterns |
| https://aws.amazon.com/blogs/developer/service-error-handling-modular-aws-sdk-js/ | AWS SDK v3 error handling patterns, DynamoDBServiceException hierarchy |

## Command-Level Docs

| URL | Command |
|-----|---------|
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/PutItemCommand/ | PutItemCommand — ConditionalCheckFailedException |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/GetItemCommand/ | GetItemCommand — ResourceNotFoundException |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/QueryCommand/ | QueryCommand — ResourceNotFoundException, ValidationException |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/ScanCommand/ | ScanCommand — ProvisionedThroughputExceededException |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/UpdateItemCommand/ | UpdateItemCommand — ConditionalCheckFailedException |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/DeleteItemCommand/ | DeleteItemCommand — ConditionalCheckFailedException |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/BatchWriteItemCommand/ | BatchWriteItemCommand — UnprocessedItems (partial failure) |
| https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/TransactWriteItemsCommand/ | TransactWriteItemsCommand — TransactionCanceledException |

## Evidence of Behavioral Contract

The AWS DynamoDB error handling guide documents:

> "Numerous components on a network... can generate errors anywhere in the life of a given request.
> The usual technique for dealing with these error responses in a networked environment is to
> implement retries in the client application."

Source: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html

The SDK documentation for every DynamoDB command notes thrown exceptions including
`ProvisionedThroughputExceededException`, `ResourceNotFoundException`, and service-specific errors.

## Real-World Usage Evidence

- `test-repos/wing` (5,376 stars on GitHub) — uses `DynamoDBClient.send()` directly in
  `counter.inflight.ts` and `dynamo.ts` without try-catch. Confirmed TRUE_POSITIVE candidates.
- Evidence quality: **partial** (1 repo found locally; broader GitHub evidence expected)
