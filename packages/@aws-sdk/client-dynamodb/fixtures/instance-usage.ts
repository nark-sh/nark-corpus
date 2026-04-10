import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

const TABLE_NAME = 'my-table';

/**
 * Class with DynamoDBClient instance stored as property
 */
class UserRepository {
  private readonly client = new DynamoDBClient({ region: 'us-east-1' });

  /**
   * VIOLATION: class instance send() without try-catch
   */
  async save(userId: string, email: string) {
    await this.client.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: { pk: { S: userId }, email: { S: email } },
    }));
  }

  /**
   * VIOLATION: class instance send() without try-catch
   */
  async findById(userId: string) {
    const response = await this.client.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: { pk: { S: userId } },
    }));
    return response.Item;
  }

  /**
   * Proper: class instance send() with try-catch
   */
  async update(userId: string, email: string) {
    try {
      await this.client.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { pk: { S: userId } },
        UpdateExpression: 'SET email = :email',
        ExpressionAttributeValues: { ':email': { S: email } },
      }));
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }
}

/**
 * Constructor-injected client
 */
class OrderRepository {
  constructor(private readonly dynamo: DynamoDBClient) {}

  /**
   * VIOLATION: injected instance send() without try-catch
   */
  async createOrder(orderId: string, customerId: string) {
    await this.dynamo.send(new PutItemCommand({
      TableName: 'orders',
      Item: { pk: { S: orderId }, customerId: { S: customerId } },
    }));
  }

  /**
   * Proper: injected instance send() with try-catch
   */
  async queryOrders(customerId: string) {
    try {
      const response = await this.dynamo.send(new QueryCommand({
        TableName: 'orders',
        IndexName: 'CustomerIndex',
        KeyConditionExpression: 'customerId = :cid',
        ExpressionAttributeValues: { ':cid': { S: customerId } },
      }));
      return response.Items ?? [];
    } catch (error) {
      console.error('Query orders failed:', error);
      return [];
    }
  }
}

/**
 * Module-level client shared across functions
 */
const sharedClient = new DynamoDBClient({ region: 'eu-west-1' });

/**
 * VIOLATION: module-level client send() without try-catch
 */
export async function writeAuditLog(eventId: string, action: string) {
  await sharedClient.send(new PutItemCommand({
    TableName: 'audit-log',
    Item: { pk: { S: eventId }, action: { S: action } },
  }));
}

/**
 * Proper: module-level client with try-catch
 */
export async function readAuditLog(eventId: string) {
  try {
    const result = await sharedClient.send(new GetItemCommand({
      TableName: 'audit-log',
      Key: { pk: { S: eventId } },
    }));
    return result.Item;
  } catch (error) {
    console.error('Read audit log failed:', error);
    return null;
  }
}
