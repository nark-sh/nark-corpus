/**
 * @aws-sdk/client-sqs Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the @aws-sdk/client-sqs contract spec, NOT V1 behavior.
 *
 * Contracted functions (all via SQSClient imported from "@aws-sdk/client-sqs"):
 *   - sqsClient.send()   postcondition: aws-service-error
 *
 * Pattern: SQSClient.send(new XxxCommand(...)) — all operations go through send().
 * Detected as a 2-level property chain (instance.send).
 */

import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
  GetQueueUrlCommand,
} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: 'us-east-1' });
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue';

// ─────────────────────────────────────────────────────────────────────────────
// 1. SendMessageCommand — the most common operation
// ─────────────────────────────────────────────────────────────────────────────

export async function sendMessageNoCatch(payload: object) {
  // SHOULD_FIRE: aws-service-error — send() rejects on QueueDoesNotExist/throttle/network, no try-catch
  await sqsClient.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(payload),
  }));
}

export async function sendMessageWithCatch(payload: object) {
  try {
    // SHOULD_NOT_FIRE: send() inside try-catch satisfies error handling
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(payload),
    }));
  } catch (error) {
    console.error('SendMessage failed:', error);
    throw error;
  }
}

export async function sendMessageWithReturn(payload: object) {
  try {
    // SHOULD_NOT_FIRE: send() inside try-catch with return
    const result = await sqsClient.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(payload),
    }));
    return result.MessageId;
  } catch (error) {
    console.error('Enqueue failed:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ReceiveMessageCommand — consumer loop pattern
// ─────────────────────────────────────────────────────────────────────────────

export async function receiveMessagesNoCatch() {
  // SHOULD_FIRE: aws-service-error — receive() crashes polling loop on service error, no try-catch
  const response = await sqsClient.send(new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  }));
  return response.Messages ?? [];
}

export async function receiveMessagesWithCatch() {
  try {
    // SHOULD_NOT_FIRE: receive() inside try-catch
    const response = await sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
    }));
    return response.Messages ?? [];
  } catch (error) {
    console.error('Receive failed:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DeleteMessageCommand — acknowledgment pattern
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMessageNoCatch(receiptHandle: string) {
  // SHOULD_FIRE: aws-service-error — delete() rejects on ReceiptHandleIsInvalid/network, no try-catch
  await sqsClient.send(new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }));
}

export async function deleteMessageWithCatch(receiptHandle: string) {
  try {
    // SHOULD_NOT_FIRE: delete() inside try-catch
    await sqsClient.send(new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    }));
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DeleteMessageBatchCommand — batch acknowledgment
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMessageBatchNoCatch(entries: { Id: string; ReceiptHandle: string }[]) {
  // SHOULD_FIRE: aws-service-error — batch delete rejects on network error, no try-catch
  const result = await sqsClient.send(new DeleteMessageBatchCommand({
    QueueUrl: QUEUE_URL,
    Entries: entries,
  }));
  return result.Successful;
}

export async function deleteMessageBatchWithCatch(entries: { Id: string; ReceiptHandle: string }[]) {
  try {
    // SHOULD_NOT_FIRE: batch delete inside try-catch
    const result = await sqsClient.send(new DeleteMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: entries,
    }));
    return result.Successful;
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SendMessageBatchCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function sendMessageBatchNoCatch(items: { id: string; body: string }[]) {
  // SHOULD_FIRE: aws-service-error — batch send rejects on throttle/network, no try-catch
  const result = await sqsClient.send(new SendMessageBatchCommand({
    QueueUrl: QUEUE_URL,
    Entries: items.map(i => ({ Id: i.id, MessageBody: i.body })),
  }));
  return result.Successful;
}

export async function sendMessageBatchWithCatch(items: { id: string; body: string }[]) {
  try {
    // SHOULD_NOT_FIRE: batch send inside try-catch
    const result = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: items.map(i => ({ Id: i.id, MessageBody: i.body })),
    }));
    return result.Successful;
  } catch (error) {
    console.error('Batch send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GetQueueUrlCommand — setup operation
// ─────────────────────────────────────────────────────────────────────────────

export async function getQueueUrlNoCatch(queueName: string) {
  // SHOULD_FIRE: aws-service-error — getQueueUrl rejects if queue doesn't exist, no try-catch
  const result = await sqsClient.send(new GetQueueUrlCommand({ QueueName: queueName }));
  return result.QueueUrl;
}

export async function getQueueUrlWithCatch(queueName: string) {
  try {
    // SHOULD_NOT_FIRE: getQueueUrl inside try-catch
    const result = await sqsClient.send(new GetQueueUrlCommand({ QueueName: queueName }));
    return result.QueueUrl;
  } catch (error) {
    console.error('GetQueueUrl failed:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Edge cases
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Outer try-catch that wraps the send call — still satisfies the contract
 */
export async function outerCatchPattern(payload: object) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(payload),
  });

  try {
    // SHOULD_NOT_FIRE: send() inside outer try-catch
    return await sqsClient.send(command);
  } catch (error) {
    console.error('Enqueue failed:', error);
    return null;
  }
}

/**
 * Instance stored in class property
 */
class SqsWorker {
  private readonly sqs = new SQSClient({ region: 'us-east-1' });

  async processNoCatch(body: string) {
    // SHOULD_FIRE: aws-service-error — class instance send() without try-catch
    await this.sqs.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: body,
    }));
  }

  async processWithCatch(body: string) {
    try {
      // SHOULD_NOT_FIRE: class instance send() inside try-catch
      await this.sqs.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: body,
      }));
    } catch (error) {
      console.error('Process failed:', error);
      throw error;
    }
  }
}
