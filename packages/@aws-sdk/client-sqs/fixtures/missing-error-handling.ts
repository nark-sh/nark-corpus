import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: 'us-east-1' });
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue';

/**
 * VIOLATION: SendMessage without try-catch
 * Messages silently dropped if SQS is unavailable or queue doesn't exist.
 */
async function sendJobMessageNoCatch(jobId: string, payload: object) {
  const response = await sqsClient.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(payload),
    MessageAttributes: {
      jobId: { DataType: 'String', StringValue: jobId },
    },
  }));
  return response.MessageId;
}

/**
 * VIOLATION: SendMessage in API route without try-catch
 * QueueDoesNotExist or network error crashes the route handler.
 */
async function handleOrderCreated(orderId: string, items: unknown[]) {
  const response = await sqsClient.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ orderId, items }),
  }));
  console.log('Order queued:', response.MessageId);
  return response;
}

/**
 * VIOLATION: SendMessageBatch without try-catch
 */
async function sendBatchNoCatch(items: { id: string; data: object }[]) {
  const response = await sqsClient.send(new SendMessageBatchCommand({
    QueueUrl: QUEUE_URL,
    Entries: items.map(item => ({
      Id: item.id,
      MessageBody: JSON.stringify(item.data),
    })),
  }));
  return response.Successful;
}

/**
 * VIOLATION: ReceiveMessage without try-catch
 * Service error crashes the polling loop, stopping all message processing.
 */
async function pollMessagesNoCatch() {
  const response = await sqsClient.send(new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  }));
  return response.Messages ?? [];
}

/**
 * VIOLATION: DeleteMessage without try-catch
 * ReceiptHandleIsInvalid or network error leaves message undeleted.
 */
async function acknowledgeMessageNoCatch(receiptHandle: string) {
  await sqsClient.send(new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }));
}

/**
 * VIOLATION: DeleteMessageBatch without try-catch
 */
async function acknowledgeMessagesNoCatch(messages: { id: string; receiptHandle: string }[]) {
  const response = await sqsClient.send(new DeleteMessageBatchCommand({
    QueueUrl: QUEUE_URL,
    Entries: messages.map(m => ({
      Id: m.id,
      ReceiptHandle: m.receiptHandle,
    })),
  }));
  return response.Successful;
}
