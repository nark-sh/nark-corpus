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

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE_NAME = process.env.TABLE_NAME || 'my-table';

/**
 * Proper: PutItem with full try-catch
 */
async function createItem(pk: string, data: Record<string, unknown>) {
  try {
    await dynamoClient.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: { pk: { S: pk }, data: { S: JSON.stringify(data) } },
    }));
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
}

/**
 * Proper: GetItem with try-catch
 */
async function getItem(pk: string) {
  try {
    const response = await dynamoClient.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: { pk: { S: pk } },
    }));
    return response.Item;
  } catch (error) {
    console.error('Failed to get item:', error);
    throw error;
  }
}

/**
 * Proper: Query with try-catch
 */
async function queryByPartitionKey(pk: string) {
  try {
    const response = await dynamoClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': { S: pk } },
    }));
    return response.Items ?? [];
  } catch (error) {
    console.error('Failed to query items:', error);
    return [];
  }
}

/**
 * Proper: Scan with try-catch
 */
async function scanTable() {
  try {
    const response = await dynamoClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 100,
    }));
    return response.Items ?? [];
  } catch (error) {
    console.error('Failed to scan table:', error);
    return [];
  }
}

/**
 * Proper: UpdateItem with try-catch
 */
async function updateItem(pk: string, value: string) {
  try {
    await dynamoClient.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { pk: { S: pk } },
      UpdateExpression: 'SET #v = :value',
      ExpressionAttributeNames: { '#v': 'value' },
      ExpressionAttributeValues: { ':value': { S: value } },
    }));
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
}

/**
 * Proper: DeleteItem with try-catch
 */
async function deleteItem(pk: string) {
  try {
    await dynamoClient.send(new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: { pk: { S: pk } },
    }));
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}

/**
 * Proper: BatchWriteItem with try-catch
 */
async function batchWrite(items: { pk: string; value: string }[]) {
  try {
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
  } catch (error) {
    console.error('Failed to batch write:', error);
    throw error;
  }
}

/**
 * Proper: BatchGetItem with try-catch
 */
async function batchGet(keys: string[]) {
  try {
    const response = await dynamoClient.send(new BatchGetItemCommand({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: keys.map(k => ({ pk: { S: k } })),
        },
      },
    }));
    return response.Responses?.[TABLE_NAME] ?? [];
  } catch (error) {
    console.error('Failed to batch get:', error);
    throw error;
  }
}

/**
 * Proper: TransactWriteItems with try-catch
 */
async function transactWrite(pk1: string, pk2: string) {
  try {
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
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * Proper: Outer try-catch wrapping send
 */
async function saveEvent(eventId: string, payload: object) {
  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: { pk: { S: eventId }, body: { S: JSON.stringify(payload) } },
  });

  try {
    return await dynamoClient.send(command);
  } catch (error) {
    console.error('Save event failed:', error);
    return null;
  }
}
