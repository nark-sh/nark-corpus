/**
 * @aws-sdk/client-dynamodb Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the @aws-sdk/client-dynamodb contract spec, NOT V1 behavior.
 *
 * Contracted functions (all via DynamoDBClient imported from "@aws-sdk/client-dynamodb"):
 *   - dynamoClient.send()   postcondition: aws-dynamodb-service-error
 *
 * Pattern: DynamoDBClient.send(new XxxCommand(...)) — all operations go through send().
 * Detected as a 2-level property chain (instance.send).
 */

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  BatchWriteItemCommand,
  BatchGetItemCommand,
  TransactWriteItemsCommand,
  ExecuteStatementCommand,
  ExecuteTransactionCommand,
  BatchExecuteStatementCommand,
} from '@aws-sdk/client-dynamodb';

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const TABLE = 'my-table';

// ─────────────────────────────────────────────────────────────────────────────
// 1. PutItemCommand — most common write operation
// ─────────────────────────────────────────────────────────────────────────────

export async function putItemNoCatch(pk: string, value: string) {
  // SHOULD_FIRE: aws-dynamodb-service-error — send() rejects on ConditionalCheckFailed/network, no try-catch
  await dynamoClient.send(new PutItemCommand({
    TableName: TABLE,
    Item: { pk: { S: pk }, value: { S: value } },
  }));
}

export async function putItemWithCatch(pk: string, value: string) {
  try {
    // SHOULD_NOT_FIRE: send() inside try-catch satisfies error handling
    await dynamoClient.send(new PutItemCommand({
      TableName: TABLE,
      Item: { pk: { S: pk }, value: { S: value } },
    }));
  } catch (error) {
    console.error('PutItem failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GetItemCommand — read by primary key
// ─────────────────────────────────────────────────────────────────────────────

export async function getItemNoCatch(pk: string) {
  // SHOULD_FIRE: aws-dynamodb-service-error — send() rejects on ResourceNotFound/network, no try-catch
  const response = await dynamoClient.send(new GetItemCommand({
    TableName: TABLE,
    Key: { pk: { S: pk } },
  }));
  return response.Item;
}

export async function getItemWithCatch(pk: string) {
  try {
    // SHOULD_NOT_FIRE: send() inside try-catch
    const response = await dynamoClient.send(new GetItemCommand({
      TableName: TABLE,
      Key: { pk: { S: pk } },
    }));
    return response.Item;
  } catch (error) {
    console.error('GetItem failed:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QueryCommand — query by partition key
// ─────────────────────────────────────────────────────────────────────────────

export async function queryNoCatch(pk: string) {
  // SHOULD_FIRE: aws-dynamodb-service-error — query rejects on throughput exceeded/table not found, no try-catch
  const response = await dynamoClient.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': { S: pk } },
  }));
  return response.Items ?? [];
}

export async function queryWithCatch(pk: string) {
  try {
    // SHOULD_NOT_FIRE: query inside try-catch
    const response = await dynamoClient.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': { S: pk } },
    }));
    return response.Items ?? [];
  } catch (error) {
    console.error('Query failed:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ScanCommand — full table scan
// ─────────────────────────────────────────────────────────────────────────────

export async function scanNoCatch() {
  // SHOULD_FIRE: aws-dynamodb-service-error — scan rejects on throughput exceeded, no try-catch
  const response = await dynamoClient.send(new ScanCommand({ TableName: TABLE }));
  return response.Items ?? [];
}

export async function scanWithCatch() {
  try {
    // SHOULD_NOT_FIRE: scan inside try-catch
    const response = await dynamoClient.send(new ScanCommand({ TableName: TABLE }));
    return response.Items ?? [];
  } catch (error) {
    console.error('Scan failed:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. UpdateItemCommand — conditional update
// ─────────────────────────────────────────────────────────────────────────────

export async function updateItemNoCatch(pk: string, value: string) {
  // SHOULD_FIRE: aws-dynamodb-service-error — update rejects on ConditionalCheckFailed, no try-catch
  await dynamoClient.send(new UpdateItemCommand({
    TableName: TABLE,
    Key: { pk: { S: pk } },
    UpdateExpression: 'SET #v = :value',
    ExpressionAttributeNames: { '#v': 'value' },
    ExpressionAttributeValues: { ':value': { S: value } },
  }));
}

export async function updateItemWithCatch(pk: string, value: string) {
  try {
    // SHOULD_NOT_FIRE: update inside try-catch
    await dynamoClient.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { pk: { S: pk } },
      UpdateExpression: 'SET #v = :value',
      ExpressionAttributeNames: { '#v': 'value' },
      ExpressionAttributeValues: { ':value': { S: value } },
    }));
  } catch (error) {
    console.error('UpdateItem failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DeleteItemCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteItemNoCatch(pk: string) {
  // SHOULD_FIRE: aws-dynamodb-service-error — delete rejects on ResourceNotFound/network, no try-catch
  await dynamoClient.send(new DeleteItemCommand({
    TableName: TABLE,
    Key: { pk: { S: pk } },
  }));
}

export async function deleteItemWithCatch(pk: string) {
  try {
    // SHOULD_NOT_FIRE: delete inside try-catch
    await dynamoClient.send(new DeleteItemCommand({
      TableName: TABLE,
      Key: { pk: { S: pk } },
    }));
  } catch (error) {
    console.error('DeleteItem failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BatchWriteItemCommand — batch write
// ─────────────────────────────────────────────────────────────────────────────

export async function batchWriteNoCatch(items: { pk: string; value: string }[]) {
  // SHOULD_FIRE: aws-dynamodb-service-error — batch write rejects on network/throughput, no try-catch
  const result = await dynamoClient.send(new BatchWriteItemCommand({
    RequestItems: {
      [TABLE]: items.map(item => ({
        PutRequest: { Item: { pk: { S: item.pk }, value: { S: item.value } } },
      })),
    },
  }));
  return result.UnprocessedItems;
}

export async function batchWriteWithCatch(items: { pk: string; value: string }[]) {
  try {
    // SHOULD_NOT_FIRE: batch write inside try-catch
    const result = await dynamoClient.send(new BatchWriteItemCommand({
      RequestItems: {
        [TABLE]: items.map(item => ({
          PutRequest: { Item: { pk: { S: item.pk }, value: { S: item.value } } },
        })),
      },
    }));
    return result.UnprocessedItems;
  } catch (error) {
    console.error('BatchWrite failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. BatchGetItemCommand — batch read
// ─────────────────────────────────────────────────────────────────────────────

export async function batchGetNoCatch(keys: string[]) {
  // SHOULD_FIRE: aws-dynamodb-service-error — batch get rejects on network/throughput, no try-catch
  const result = await dynamoClient.send(new BatchGetItemCommand({
    RequestItems: {
      [TABLE]: { Keys: keys.map(k => ({ pk: { S: k } })) },
    },
  }));
  return result.Responses?.[TABLE] ?? [];
}

export async function batchGetWithCatch(keys: string[]) {
  try {
    // SHOULD_NOT_FIRE: batch get inside try-catch
    const result = await dynamoClient.send(new BatchGetItemCommand({
      RequestItems: {
        [TABLE]: { Keys: keys.map(k => ({ pk: { S: k } })) },
      },
    }));
    return result.Responses?.[TABLE] ?? [];
  } catch (error) {
    console.error('BatchGet failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TransactWriteItemsCommand — atomic multi-table write
// ─────────────────────────────────────────────────────────────────────────────

export async function transactWriteNoCatch(pk1: string, pk2: string) {
  // SHOULD_FIRE: aws-dynamodb-service-error — transaction rejects on TransactionCancelled/network, no try-catch
  await dynamoClient.send(new TransactWriteItemsCommand({
    TransactItems: [
      { Put: { TableName: TABLE, Item: { pk: { S: pk1 } } } },
      { Delete: { TableName: TABLE, Key: { pk: { S: pk2 } } } },
    ],
  }));
}

export async function transactWriteWithCatch(pk1: string, pk2: string) {
  try {
    // SHOULD_NOT_FIRE: transaction inside try-catch
    await dynamoClient.send(new TransactWriteItemsCommand({
      TransactItems: [
        { Put: { TableName: TABLE, Item: { pk: { S: pk1 } } } },
        { Delete: { TableName: TABLE, Key: { pk: { S: pk2 } } } },
      ],
    }));
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW POSTCONDITIONS — batch-write-unprocessed-items-not-checked
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: batch-write-unprocessed-items-not-checked
// BatchWriteItemCommand called without checking response.UnprocessedItems
// HTTP 200 is returned even when some items fail — silent data loss
export async function batchWriteIgnoresUnprocessedItems(items: { pk: string; value: string }[]) {
  try {
    const result = await dynamoClient.send(new BatchWriteItemCommand({
      RequestItems: {
        [TABLE]: items.map(item => ({
          PutRequest: { Item: { pk: { S: item.pk }, value: { S: item.value } } },
        })),
      },
    }));
    // ❌ Ignores result.UnprocessedItems — silent data loss if some writes failed
    return { success: true };
  } catch (error) {
    console.error('BatchWrite failed:', error);
    throw error;
  }
}

// @expect-clean
// BatchWriteItemCommand with proper UnprocessedItems check
export async function batchWriteChecksUnprocessedItems(items: { pk: string; value: string }[]) {
  try {
    const result = await dynamoClient.send(new BatchWriteItemCommand({
      RequestItems: {
        [TABLE]: items.map(item => ({
          PutRequest: { Item: { pk: { S: item.pk }, value: { S: item.value } } },
        })),
      },
    }));
    // ✅ Checks UnprocessedItems — handles partial failure
    if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
      throw new Error(`BatchWrite partial failure: ${JSON.stringify(result.UnprocessedItems)}`);
    }
    return { success: true };
  } catch (error) {
    console.error('BatchWrite failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW POSTCONDITIONS — batch-get-unprocessed-keys-not-checked
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: batch-get-unprocessed-keys-not-checked
// BatchGetItemCommand called without checking response.UnprocessedKeys
// HTTP 200 with partial results — missing items silently omitted from response.Responses
export async function batchGetIgnoresUnprocessedKeys(keys: string[]) {
  try {
    const result = await dynamoClient.send(new BatchGetItemCommand({
      RequestItems: {
        [TABLE]: { Keys: keys.map(k => ({ pk: { S: k } })) },
      },
    }));
    // ❌ Returns only successfully retrieved items, ignores UnprocessedKeys
    // If throughput limit hit, some items silently missing from Responses
    return result.Responses?.[TABLE] ?? [];
  } catch (error) {
    console.error('BatchGet failed:', error);
    throw error;
  }
}

// @expect-clean
// BatchGetItemCommand with proper UnprocessedKeys retry loop
export async function batchGetChecksUnprocessedKeys(keys: string[]) {
  let remainingKeys = { [TABLE]: { Keys: keys.map(k => ({ pk: { S: k } })) } };
  const allItems: Record<string, unknown>[] = [];

  try {
    while (Object.keys(remainingKeys).length > 0) {
      const result = await dynamoClient.send(new BatchGetItemCommand({
        RequestItems: remainingKeys,
      }));
      // ✅ Accumulates all retrieved items
      for (const tableItems of Object.values(result.Responses ?? {})) {
        allItems.push(...(tableItems as Record<string, unknown>[]));
      }
      // ✅ Retries UnprocessedKeys until none remain
      remainingKeys = result.UnprocessedKeys ?? {};
    }
    return allItems;
  } catch (error) {
    console.error('BatchGet failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW POSTCONDITIONS — transact-write-cancellation-reasons-not-inspected
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: transact-write-cancellation-reasons-not-inspected
// TransactWriteItemsCommand catches TransactionCanceledException but does not
// inspect CancellationReasons — cannot distinguish ConditionalCheckFailed
// (business conflict, not retryable) from ProvisionedThroughputExceeded (retryable)
export async function transactWriteWithoutCancellationReasonCheck(pk1: string, pk2: string) {
  try {
    await dynamoClient.send(new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: { pk: { S: pk1 } },
            ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
        { Delete: { TableName: TABLE, Key: { pk: { S: pk2 } } } },
      ],
    }));
  } catch (error: unknown) {
    // ❌ Catches error but does not inspect CancellationReasons
    // Cannot tell if this is a business conflict or infrastructure failure
    if (error instanceof Error && error.name === 'TransactionCanceledException') {
      console.error('Transaction cancelled:', error.message);
      throw error;
    }
    throw error;
  }
}

// @expect-clean
// TransactWriteItemsCommand with proper CancellationReasons inspection
export async function transactWriteWithCancellationReasonCheck(pk1: string, pk2: string) {
  try {
    await dynamoClient.send(new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: { pk: { S: pk1 } },
            ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
        { Delete: { TableName: TABLE, Key: { pk: { S: pk2 } } } },
      ],
    }));
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TransactionCanceledException') {
      const cancelledError = error as Error & {
        CancellationReasons?: Array<{ Code?: string; Message?: string }>;
      };
      // ✅ Inspect CancellationReasons to distinguish conflict types
      for (const reason of cancelledError.CancellationReasons ?? []) {
        if (reason.Code === 'ConditionalCheckFailed') {
          throw new Error(`Optimistic lock conflict: ${reason.Message}`);
        } else if (reason.Code === 'TransactionConflict') {
          throw new Error(`Concurrent transaction: ${reason.Message}`);
        }
      }
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW POSTCONDITIONS — execute-statement-duplicate-item
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: execute-statement-duplicate-item
// ExecuteStatementCommand with PartiQL INSERT without handling DuplicateItemException
// Unlike PutItemCommand (which silently overwrites), INSERT throws on duplicate primary key
export async function executeInsertNoCatch(userId: string, email: string) {
  // ❌ No try-catch — DuplicateItemException crashes on duplicate userId
  await dynamoClient.send(new ExecuteStatementCommand({
    Statement: `INSERT INTO Users VALUE {'userId': ?, 'email': ?}`,
    Parameters: [{ S: userId }, { S: email }],
  }));
}

// @expect-violation: execute-statement-duplicate-item
// Catches error but does not handle DuplicateItemException specifically
export async function executeInsertGenericCatch(userId: string, email: string) {
  try {
    await dynamoClient.send(new ExecuteStatementCommand({
      Statement: `INSERT INTO Users VALUE {'userId': ?, 'email': ?}`,
      Parameters: [{ S: userId }, { S: email }],
    }));
  } catch (error) {
    // ❌ Generic catch — user gets 500 instead of "user already exists" message
    console.error('Insert failed:', error);
    throw error;
  }
}

// @expect-clean
// ExecuteStatementCommand with proper DuplicateItemException handling
export async function executeInsertWithDuplicateCheck(userId: string, email: string) {
  try {
    await dynamoClient.send(new ExecuteStatementCommand({
      Statement: `INSERT INTO Users VALUE {'userId': ?, 'email': ?}`,
      Parameters: [{ S: userId }, { S: email }],
    }));
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'DuplicateItemException') {
      // ✅ Handle duplicate as expected business case
      throw new Error(`User with email ${email} already exists`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW POSTCONDITIONS — execute-transaction-cancellation-reasons-not-inspected
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: execute-transaction-cancellation-reasons-not-inspected
// ExecuteTransactionCommand catches TransactionCanceledException but does not inspect
// CancellationReasons — cannot distinguish ConditionalCheckFailed from infrastructure failures
export async function executeTransactionWithoutCancellationCheck(userId: string, orderId: string) {
  try {
    await dynamoClient.send(new ExecuteTransactionCommand({
      TransactStatements: [
        {
          Statement: `UPDATE Users SET balance = balance - 10 WHERE userId = ?`,
          Parameters: [{ S: userId }],
        },
        {
          Statement: `INSERT INTO Orders VALUE {'orderId': ?, 'userId': ?, 'amount': 10}`,
          Parameters: [{ S: orderId }, { S: userId }],
        },
      ],
    }));
  } catch (error: unknown) {
    // ❌ Catches TransactionCanceledException but does not inspect CancellationReasons
    // Cannot distinguish ConditionalCheckFailed (business conflict) from ProvisionedThroughputExceeded (retryable)
    if (error instanceof Error && error.name === 'TransactionCanceledException') {
      console.error('Transaction cancelled:', error.message);
      throw new Error('Transaction failed');
    }
    throw error;
  }
}

// @expect-violation: execute-transaction-idempotent-parameter-mismatch
// ExecuteTransactionCommand without try-catch — TransactionCanceledException and
// IdempotentParameterMismatchException both crash without handling
export async function executeTransactionNoCatch(userId: string, orderId: string) {
  // ❌ No try-catch — TransactionCanceledException, IdempotentParameterMismatchException crash
  await dynamoClient.send(new ExecuteTransactionCommand({
    TransactStatements: [
      {
        Statement: `UPDATE Users SET balance = balance - 10 WHERE userId = ?`,
        Parameters: [{ S: userId }],
      },
    ],
    ClientRequestToken: 'reused-token-123',
  }));
}

// @expect-clean
// ExecuteTransactionCommand with proper CancellationReasons inspection
export async function executeTransactionWithCancellationCheck(userId: string, orderId: string) {
  try {
    await dynamoClient.send(new ExecuteTransactionCommand({
      TransactStatements: [
        {
          Statement: `UPDATE Users SET balance = balance - 10 WHERE userId = ?`,
          Parameters: [{ S: userId }],
        },
        {
          Statement: `INSERT INTO Orders VALUE {'orderId': ?, 'userId': ?, 'amount': 10}`,
          Parameters: [{ S: orderId }, { S: userId }],
        },
      ],
    }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TransactionCanceledException') {
        const cancelledError = error as Error & {
          CancellationReasons?: Array<{ Code?: string; Message?: string }>;
        };
        // ✅ Inspect CancellationReasons to distinguish conflict types
        for (const reason of cancelledError.CancellationReasons ?? []) {
          if (reason.Code === 'ConditionalCheckFailed') {
            throw new Error(`Business conflict: ${reason.Message}`);
          } else if (reason.Code === 'DuplicateItem') {
            throw new Error(`Duplicate order: ${reason.Message}`);
          }
        }
        throw new Error(`Transaction infrastructure failure: ${error.message}`);
      }
      if (error.name === 'IdempotentParameterMismatchException') {
        // ✅ Different payload with same token — programming error
        throw new Error('Token reuse with different payload: use a new unique token');
      }
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW POSTCONDITIONS — batch-execute-statement-response-errors-not-checked
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: batch-execute-statement-response-errors-not-checked
// BatchExecuteStatementCommand called without iterating Responses for per-item errors
// HTTP 200 is returned even when individual statements fail — silent data loss
export async function batchExecuteIgnoresResponseErrors(
  userIds: string[],
  emails: string[],
) {
  try {
    const result = await dynamoClient.send(new BatchExecuteStatementCommand({
      Statements: userIds.map((userId, i) => ({
        Statement: `INSERT INTO Users VALUE {'userId': ?, 'email': ?}`,
        Parameters: [{ S: userId }, { S: emails[i] }],
      })),
    }));
    // ❌ Returns result without checking Responses[].Error
    // DuplicateItem or ConditionalCheckFailed silently swallowed for individual statements
    return result.Responses?.length ?? 0;
  } catch (error) {
    console.error('BatchExecuteStatement failed:', error);
    throw error;
  }
}

// @expect-clean
// BatchExecuteStatementCommand with proper per-item error checking
export async function batchExecuteChecksResponseErrors(
  userIds: string[],
  emails: string[],
) {
  try {
    const result = await dynamoClient.send(new BatchExecuteStatementCommand({
      Statements: userIds.map((userId, i) => ({
        Statement: `INSERT INTO Users VALUE {'userId': ?, 'email': ?}`,
        Parameters: [{ S: userId }, { S: emails[i] }],
      })),
    }));
    // ✅ Check each response for per-item errors
    const failures: string[] = [];
    for (const [i, response] of (result.Responses ?? []).entries()) {
      if (response.Error) {
        const code = response.Error.Code;
        if (code === 'DuplicateItem') {
          failures.push(`Statement ${i}: duplicate item — ${response.Error.Message}`);
        } else if (code === 'ConditionalCheckFailed') {
          failures.push(`Statement ${i}: condition check failed`);
        } else if (code === 'ProvisionedThroughputExceeded' || code === 'ThrottlingError') {
          failures.push(`Statement ${i}: throttled — retry with exponential backoff`);
        } else {
          failures.push(`Statement ${i}: ${code} — ${response.Error.Message}`);
        }
      }
    }
    if (failures.length > 0) {
      throw new Error(`BatchExecuteStatement partial failure:\n${failures.join('\n')}`);
    }
    return result.Responses?.length ?? 0;
  } catch (error) {
    console.error('BatchExecuteStatement failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Edge cases
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Outer try-catch wrapping send — still satisfies the contract
 */
export async function outerCatchPattern(pk: string, value: string) {
  const command = new PutItemCommand({
    TableName: TABLE,
    Item: { pk: { S: pk }, value: { S: value } },
  });

  try {
    // SHOULD_NOT_FIRE: send() inside outer try-catch
    return await dynamoClient.send(command);
  } catch (error) {
    console.error('Save failed:', error);
    return null;
  }
}

/**
 * Class instance stored as property
 */
class DynamoRepository {
  private readonly db = new DynamoDBClient({ region: 'us-east-1' });

  async saveNoCatch(pk: string, value: string) {
    // SHOULD_FIRE: aws-dynamodb-service-error — class instance send() without try-catch
    await this.db.send(new PutItemCommand({
      TableName: TABLE,
      Item: { pk: { S: pk }, value: { S: value } },
    }));
  }

  async saveWithCatch(pk: string, value: string) {
    try {
      // SHOULD_NOT_FIRE: class instance send() inside try-catch
      await this.db.send(new PutItemCommand({
        TableName: TABLE,
        Item: { pk: { S: pk }, value: { S: value } },
      }));
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// N. waitUntil* family — polling waiters that throw TimeoutError / AbortError
//    via @smithy/util-waiter checkExceptions. Postcondition family applies to
//    all 6 exported waitUntil* helpers (Table[Not]Exists, ContributorInsightsEnabled,
//    Export/Import Completed, KinesisStreamingDestinationActive).
// ─────────────────────────────────────────────────────────────────────────────

import {
  waitUntilTableExists,
  waitUntilTableNotExists,
  waitUntilExportCompleted,
  waitUntilImportCompleted,
  waitUntilContributorInsightsEnabled,
  waitUntilKinesisStreamingDestinationActive,
} from '@aws-sdk/client-dynamodb';

export async function provisionTenantTableNoCatch(tableName: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — scanner gap: waitUntilTableExists standalone import not detected (concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  await waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 60 },
    { TableName: tableName },
  );
}

export async function deprovisionTenantTableNoCatch(tableName: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — no scanner rule yet (queued concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  // Same family member — waitUntilTableNotExists also rejects with TimeoutError / AbortError.
  await waitUntilTableNotExists(
    { client: dynamoClient, maxWaitTime: 60 },
    { TableName: tableName },
  );
}

export async function waitForExportNoCatch(exportArn: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — no scanner rule yet (queued concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  // Export workflow triggered from API endpoint — runtime path, not infrastructure-only.
  await waitUntilExportCompleted(
    { client: dynamoClient, maxWaitTime: 600 },
    { ExportArn: exportArn },
  );
}

export async function waitForImportNoCatch(importArn: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — no scanner rule yet (queued concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  await waitUntilImportCompleted(
    { client: dynamoClient, maxWaitTime: 600 },
    { ImportArn: importArn },
  );
}

export async function waitForContributorInsightsNoCatch(tableName: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — no scanner rule yet (queued concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  await waitUntilContributorInsightsEnabled(
    { client: dynamoClient, maxWaitTime: 120 },
    { TableName: tableName },
  );
}

export async function waitForKinesisDestNoCatch(tableName: string, streamArn: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — no scanner rule yet (queued concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  await waitUntilKinesisStreamingDestinationActive(
    { client: dynamoClient, maxWaitTime: 120 },
    { TableName: tableName, StreamArn: streamArn },
  );
}

export async function provisionTenantTableWithCatch(tableName: string) {
  // SHOULD_NOT_FIRE: try-catch present, distinguishes TimeoutError / AbortError
  try {
    await waitUntilTableExists(
      { client: dynamoClient, maxWaitTime: 60 },
      { TableName: tableName },
    );
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Table ${tableName} did not become ACTIVE within 60s`);
    }
    if (error.name === 'AbortError') {
      throw error; // Propagate cancellation distinctly
    }
    throw error;
  }
}

export async function waitForExportWithCancellationHandling(exportArn: string, signal: AbortSignal) {
  // SHOULD_NOT_FIRE: try-catch with abort-aware branch for cancellation paths
  try {
    await waitUntilExportCompleted(
      { client: dynamoClient, maxWaitTime: 600, abortSignal: signal },
      { ExportArn: exportArn },
    );
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Caller cancelled — 499 Client Closed Request, not 500
      throw new Error('Export wait cancelled by caller');
    }
    if (error.name === 'TimeoutError') {
      throw new Error('Export did not complete within 10 minutes');
    }
    throw error;
  }
}

export async function fireAndForgetWaitNoCatch(tableName: string) {
  // FUTURE_SHOULD_FIRE: aws-dynamodb-wait-until-table-exists-no-try-catch — no scanner rule yet (queued concern-20260623-aws-sdk-client-dynamodb-deepen-7)
  // Fire-and-forget pattern — no await, no .catch — TimeoutError becomes unhandled rejection.
  waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 60 },
    { TableName: tableName },
  );
}

export function waitWithCatchHandler(tableName: string) {
  // SHOULD_NOT_FIRE: .catch() chained on returned promise — abort-aware branch
  return waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 60 },
    { TableName: tableName },
  ).catch((error: any) => {
    if (error.name === 'AbortError') {
      return { cancelled: true };
    }
    throw error;
  });
}
