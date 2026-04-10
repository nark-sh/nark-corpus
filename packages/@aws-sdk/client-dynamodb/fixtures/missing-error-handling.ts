import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  BatchWriteItemCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const TABLE_NAME = 'my-table';

/**
 * VIOLATION: PutItem without try-catch
 * ConditionalCheckFailedException or network error crashes the caller.
 */
async function createItemNoCatch(pk: string, data: Record<string, unknown>) {
  await dynamoClient.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: { pk: { S: pk }, data: { S: JSON.stringify(data) } },
  }));
}

/**
 * VIOLATION: GetItem without try-catch in API handler
 * ResourceNotFoundException or network error crashes the route.
 */
async function handleGetUser(userId: string) {
  const response = await dynamoClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: { pk: { S: userId } },
  }));
  return response.Item;
}

/**
 * VIOLATION: Query without try-catch
 * ProvisionedThroughputExceededException crashes the query.
 */
async function queryItemsNoCatch(pk: string) {
  const response = await dynamoClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': { S: pk } },
  }));
  return response.Items ?? [];
}

/**
 * VIOLATION: Scan without try-catch
 */
async function scanTableNoCatch() {
  const response = await dynamoClient.send(new ScanCommand({
    TableName: TABLE_NAME,
  }));
  return response.Items ?? [];
}

/**
 * VIOLATION: UpdateItem without try-catch
 * ConditionalCheckFailedException from optimistic locking goes unhandled.
 */
async function updateItemNoCatch(pk: string, value: string) {
  await dynamoClient.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { pk: { S: pk } },
    UpdateExpression: 'SET #v = :value',
    ConditionExpression: 'attribute_exists(pk)',
    ExpressionAttributeNames: { '#v': 'value' },
    ExpressionAttributeValues: { ':value': { S: value } },
  }));
}

/**
 * VIOLATION: DeleteItem without try-catch
 */
async function deleteItemNoCatch(pk: string) {
  await dynamoClient.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: { pk: { S: pk } },
  }));
}

/**
 * VIOLATION: BatchWriteItem without try-catch
 */
async function batchWriteNoCatch(items: { pk: string; value: string }[]) {
  const response = await dynamoClient.send(new BatchWriteItemCommand({
    RequestItems: {
      [TABLE_NAME]: items.map(item => ({
        PutRequest: {
          Item: { pk: { S: item.pk }, value: { S: item.value } },
        },
      })),
    },
  }));
  return response.UnprocessedItems;
}

/**
 * VIOLATION: TransactWriteItems without try-catch
 * TransactionCanceledException goes unhandled — optimistic lock failure silently dropped.
 */
async function transactWriteNoCatch(pk1: string, pk2: string) {
  await dynamoClient.send(new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: { pk: { S: pk1 }, status: { S: 'active' } },
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
      {
        Update: {
          TableName: TABLE_NAME,
          Key: { pk: { S: pk2 } },
          UpdateExpression: 'SET #c = #c + :one',
          ExpressionAttributeNames: { '#c': 'count' },
          ExpressionAttributeValues: { ':one': { N: '1' } },
        },
      },
    ],
  }));
}
