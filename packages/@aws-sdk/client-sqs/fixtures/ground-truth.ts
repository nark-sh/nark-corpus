/**
 * @aws-sdk/client-sqs Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the @aws-sdk/client-sqs contract spec, NOT V1 behavior.
 *
 * Contracted functions (all via SQSClient imported from "@aws-sdk/client-sqs"):
 *   - sqsClient.send()                    postcondition: aws-service-error
 *   - send(SendMessageBatchCommand)        postconditions: sqs-send-batch-failed-not-checked, sqs-send-batch-no-try-catch
 *   - send(DeleteMessageBatchCommand)      postcondition: sqs-delete-batch-failed-not-checked
 *   - send(ReceiveMessageCommand)          postconditions: sqs-receive-no-try-catch, sqs-receive-messages-undefined
 *   - send(DeleteMessageCommand)           postcondition: sqs-delete-receipt-handle-invalid
 *   - send(CreateQueueCommand)             postcondition: sqs-create-queue-no-try-catch
 *   - send(PurgeQueueCommand)              postcondition: sqs-purge-in-progress
 *   - send(ChangeMessageVisibilityCommand) postcondition: sqs-change-visibility-not-inflight
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
  CreateQueueCommand,
  PurgeQueueCommand,
  ChangeMessageVisibilityCommand,
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

// ─────────────────────────────────────────────────────────────────────────────
// 8. SendMessageBatchCommand — silent failure pattern (result.Failed not checked)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchFailedNotChecked(items: { id: string; body: string }[]) {
  // SHOULD_NOT_FIRE: scanner gap — return-value postcondition sqs-send-batch-failed-not-checked not implemented
  try {
    const result = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: items.map(i => ({ Id: i.id, MessageBody: i.body })),
    }));
    return result.Successful; // ← never checks result.Failed
  } catch (error) {
    console.error('Batch send failed:', error);
    throw error;
  }
}

export async function sendBatchProperHandling(items: { id: string; body: string }[]) {
  // @expect-clean
  // SHOULD_NOT_FIRE: both try-catch AND result.Failed check present
  try {
    const result = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: items.map(i => ({ Id: i.id, MessageBody: i.body })),
    }));
    if (result.Failed && result.Failed.length > 0) {
      for (const failure of result.Failed) {
        console.error(`Message ${failure.Id} failed: ${failure.Code}`);
      }
    }
    return result.Successful;
  } catch (error) {
    console.error('Batch send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DeleteMessageBatchCommand — silent failure pattern (result.Failed not checked)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteBatchFailedNotChecked(entries: { Id: string; ReceiptHandle: string }[]) {
  // SHOULD_NOT_FIRE: scanner gap — return-value postcondition sqs-delete-batch-failed-not-checked not implemented
  try {
    const result = await sqsClient.send(new DeleteMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: entries,
    }));
    return result.Successful; // ← never checks result.Failed
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

export async function deleteBatchProperHandling(entries: { Id: string; ReceiptHandle: string }[]) {
  // @expect-clean
  // SHOULD_NOT_FIRE: both try-catch AND result.Failed check present
  try {
    const result = await sqsClient.send(new DeleteMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: entries,
    }));
    if (result.Failed && result.Failed.length > 0) {
      console.error('Some messages not deleted', result.Failed);
    }
    return result.Successful;
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ReceiveMessageCommand — messages undefined access
// ─────────────────────────────────────────────────────────────────────────────

export async function receiveMessagesUndefinedAccess() {
  // SHOULD_NOT_FIRE: scanner gap — property-access postcondition sqs-receive-messages-undefined not implemented
  try {
    const response = await sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
    }));
    return response.Messages!.map(m => m.Body); // ← crashes if Messages is undefined (empty queue)
  } catch (error) {
    console.error('Receive failed:', error);
    return [];
  }
}

export async function receiveMessagesWithNullGuard() {
  // @expect-clean
  // SHOULD_NOT_FIRE: null-coalescing guard on Messages
  try {
    const response = await sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
    }));
    return (response.Messages ?? []).map(m => m.Body);
  } catch (error) {
    console.error('Receive failed:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. CreateQueueCommand — QueueDeletedRecently / QueueNameExists
// ─────────────────────────────────────────────────────────────────────────────

export async function createQueueNoCatch(queueName: string) {
  // @expect-violation: sqs-create-queue-no-try-catch
  // SHOULD_FIRE: sqs-create-queue-no-try-catch — no try-catch; QueueDeletedRecently throws on re-create
  const result = await sqsClient.send(new CreateQueueCommand({ QueueName: queueName }));
  return result.QueueUrl;
}

export async function createQueueWithCatch(queueName: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: wrapped in try-catch
  try {
    const result = await sqsClient.send(new CreateQueueCommand({ QueueName: queueName }));
    return result.QueueUrl;
  } catch (error: any) {
    if (error.name === 'QueueDeletedRecently') {
      throw new Error('Queue was recently deleted, retry after 60 seconds');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. PurgeQueueCommand — PurgeQueueInProgress
// ─────────────────────────────────────────────────────────────────────────────

export async function purgeQueueNoCatch() {
  // @expect-violation: sqs-purge-in-progress
  // SHOULD_FIRE: sqs-purge-in-progress — no try-catch; second purge within 60s throws
  await sqsClient.send(new PurgeQueueCommand({ QueueUrl: QUEUE_URL }));
}

export async function purgeQueueWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: wrapped in try-catch
  try {
    await sqsClient.send(new PurgeQueueCommand({ QueueUrl: QUEUE_URL }));
  } catch (error: any) {
    if (error.name === 'PurgeQueueInProgress') {
      console.warn('Queue purge already in progress');
    } else {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. ChangeMessageVisibilityCommand — MessageNotInflight
// ─────────────────────────────────────────────────────────────────────────────

export async function changeVisibilityNoCatch(receiptHandle: string) {
  // @expect-violation: sqs-change-visibility-not-inflight
  // SHOULD_FIRE: sqs-change-visibility-not-inflight — no try-catch; MessageNotInflight throws when timeout expired
  await sqsClient.send(new ChangeMessageVisibilityCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
    VisibilityTimeout: 30,
  }));
}

export async function changeVisibilityWithCatch(receiptHandle: string, messageId: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: wrapped in try-catch with MessageNotInflight handling
  try {
    await sqsClient.send(new ChangeMessageVisibilityCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: 30,
    }));
  } catch (error: any) {
    if (error.name === 'MessageNotInflight') {
      console.warn('Message visibility expired, abandoning', { messageId });
      return;
    }
    throw error;
  }
}
