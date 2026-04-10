import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
  ChangeMessageVisibilityCommand,
  GetQueueUrlCommand,
} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const QUEUE_URL = process.env.SQS_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue';

/**
 * Proper: SendMessage with full try-catch
 */
async function sendJobMessage(jobId: string, payload: object) {
  try {
    const response = await sqsClient.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(payload),
      MessageAttributes: {
        jobId: { DataType: 'String', StringValue: jobId },
      },
    }));
    return response.MessageId;
  } catch (error) {
    console.error('Failed to enqueue job:', error);
    throw error;
  }
}

/**
 * Proper: SendMessageBatch with try-catch
 */
async function sendBatchMessages(items: { id: string; data: object }[]) {
  try {
    const response = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: items.map(item => ({
        Id: item.id,
        MessageBody: JSON.stringify(item.data),
      })),
    }));
    return response.Successful;
  } catch (error) {
    console.error('Failed to send batch:', error);
    throw error;
  }
}

/**
 * Proper: ReceiveMessage with try-catch
 */
async function pollMessages() {
  try {
    const response = await sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    }));
    return response.Messages ?? [];
  } catch (error) {
    console.error('Failed to receive messages:', error);
    return [];
  }
}

/**
 * Proper: DeleteMessage with try-catch
 */
async function acknowledgeMessage(receiptHandle: string) {
  try {
    await sqsClient.send(new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    }));
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw error;
  }
}

/**
 * Proper: DeleteMessageBatch with try-catch
 */
async function acknowledgeMessages(messages: { id: string; receiptHandle: string }[]) {
  try {
    const response = await sqsClient.send(new DeleteMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: messages.map(m => ({
        Id: m.id,
        ReceiptHandle: m.receiptHandle,
      })),
    }));
    if (response.Failed && response.Failed.length > 0) {
      console.error(`Failed to delete ${response.Failed.length} messages`);
    }
    return response.Successful;
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

/**
 * Proper: ChangeMessageVisibility with try-catch
 */
async function extendVisibility(receiptHandle: string, seconds: number) {
  try {
    await sqsClient.send(new ChangeMessageVisibilityCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: seconds,
    }));
  } catch (error) {
    console.error('Failed to extend visibility:', error);
    throw error;
  }
}

/**
 * Proper: GetQueueUrl with try-catch
 */
async function resolveQueueUrl(queueName: string) {
  try {
    const response = await sqsClient.send(new GetQueueUrlCommand({
      QueueName: queueName,
    }));
    return response.QueueUrl;
  } catch (error) {
    console.error('Failed to get queue URL:', error);
    throw error;
  }
}

/**
 * Proper: Outer try-catch wrapping send
 */
async function enqueueOrderEvent(orderId: string, event: string) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ orderId, event }),
  });

  try {
    return await sqsClient.send(command);
  } catch (error) {
    console.error('Order event enqueue failed:', orderId, error);
    return null;
  }
}
