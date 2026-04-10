import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue';

/**
 * Tests instance-based detection: SQSClient instance stored in class property.
 */
class MessageQueueService {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(region: string, queueUrl: string) {
    this.client = new SQSClient({ region });
    this.queueUrl = queueUrl;
  }

  /**
   * VIOLATION: instance method using class-stored SQSClient without try-catch
   */
  async enqueue(payload: object) {
    const response = await this.client.send(new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(payload),
    }));
    return response.MessageId;
  }

  /**
   * Proper: instance method with try-catch
   */
  async enqueueWithHandling(payload: object) {
    try {
      const response = await this.client.send(new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
      }));
      return response.MessageId;
    } catch (error) {
      console.error('Enqueue failed:', error);
      throw error;
    }
  }

  /**
   * VIOLATION: receive messages without try-catch
   */
  async receive() {
    const response = await this.client.send(new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
    }));
    return response.Messages ?? [];
  }
}

/**
 * Tests factory-created SQSClient stored in module-level variable.
 */
function createQueueClient(region: string) {
  return new SQSClient({ region });
}

const queueClient = createQueueClient('us-west-2');

/**
 * VIOLATION: factory-created client without try-catch
 */
async function sendViaFactoryClient(message: string) {
  await queueClient.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: message,
  }));
}

/**
 * Tests local variable SQSClient
 */
async function sendWithLocalClient(message: string) {
  const localClient = new SQSClient({ region: 'eu-west-1' });

  /**
   * VIOLATION: local client without try-catch
   */
  await localClient.send(new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: message,
  }));
}
