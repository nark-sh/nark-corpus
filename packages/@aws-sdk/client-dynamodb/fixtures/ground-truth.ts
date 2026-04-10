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
