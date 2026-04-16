/**
 * Ground-truth fixture for @aws-sdk/client-sns
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited send() call.
 *
 * Postcondition IDs:
 *   aws-sns-service-error                        (SNSClient.send — all commands)
 *   sns-publish-batch-failed-not-checked         (PublishBatchCommand — response.Failed not inspected)
 *   sns-publish-batch-request-level-error        (PublishBatchCommand — request validation throws)
 *   sns-subscribe-subscription-limit-exceeded    (SubscribeCommand — limit error not handled)
 *   sns-subscribe-filter-policy-limit-exceeded   (SubscribeCommand — filter limit not handled)
 *   sns-subscribe-pending-confirmation-not-handled (SubscribeCommand — ARN value not checked)
 *   sns-create-topic-limit-exceeded              (CreateTopicCommand — topic limit not handled)
 *   sns-create-topic-concurrent-access-exception (CreateTopicCommand — transient race not retried)
 */
import {
  SNSClient,
  PublishCommand,
  PublishBatchCommand,
  CreateTopicCommand,
  DeleteTopicCommand,
  SubscribeCommand,
  SNSServiceException,
} from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ region: 'us-east-1' });
const TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789:my-topic';

// ──────────────────────────────────────────────────
// 1. PublishCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_publish_missing() {
  // SHOULD_FIRE: aws-sns-service-error — PublishCommand without try-catch
  const response = await snsClient.send(new PublishCommand({
    TopicArn: TOPIC_ARN,
    Message: 'hello world',
  }));
  return response.MessageId;
}

// 1. PublishCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_publish_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await snsClient.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: 'hello world',
    }));
    return response.MessageId;
  } catch (error) {
    if (error instanceof SNSServiceException) {
      console.error(`SNS error [${error.name}]:`, error.message);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 2. PublishBatchCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_publishBatch_missing() {
  // SHOULD_FIRE: aws-sns-service-error — PublishBatchCommand without try-catch
  const response = await snsClient.send(new PublishBatchCommand({
    TopicArn: TOPIC_ARN,
    PublishBatchRequestEntries: [
      { Id: '1', Message: 'msg1' },
      { Id: '2', Message: 'msg2' },
    ],
  }));
  return response.Successful;
}

// 2. PublishBatchCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_publishBatch_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await snsClient.send(new PublishBatchCommand({
      TopicArn: TOPIC_ARN,
      PublishBatchRequestEntries: [
        { Id: '1', Message: 'msg1' },
        { Id: '2', Message: 'msg2' },
      ],
    }));
    return response.Successful;
  } catch (error) {
    console.error('Batch publish failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 3. CreateTopicCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_createTopic_missing() {
  // SHOULD_FIRE: aws-sns-service-error — CreateTopicCommand without try-catch
  const response = await snsClient.send(new CreateTopicCommand({ Name: 'my-topic' }));
  return response.TopicArn;
}

// 3. CreateTopicCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_createTopic_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await snsClient.send(new CreateTopicCommand({ Name: 'my-topic' }));
    return response.TopicArn;
  } catch (error) {
    console.error('Failed to create topic:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 4. DeleteTopicCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteTopic_missing() {
  // SHOULD_FIRE: aws-sns-service-error — DeleteTopicCommand without try-catch
  await snsClient.send(new DeleteTopicCommand({ TopicArn: TOPIC_ARN }));
}

// 4. DeleteTopicCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_deleteTopic_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await snsClient.send(new DeleteTopicCommand({ TopicArn: TOPIC_ARN }));
  } catch (error) {
    if (error instanceof SNSServiceException && error.name === 'NotFound') return;
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. SubscribeCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_subscribe_missing() {
  // SHOULD_FIRE: aws-sns-service-error — SubscribeCommand without try-catch
  const response = await snsClient.send(new SubscribeCommand({
    TopicArn: TOPIC_ARN,
    Protocol: 'https',
    Endpoint: 'https://example.com/webhook',
  }));
  return response.SubscriptionArn;
}

// 5. SubscribeCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_subscribe_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await snsClient.send(new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: 'https',
      Endpoint: 'https://example.com/webhook',
    }));
    return response.SubscriptionArn;
  } catch (error) {
    console.error('Subscribe failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// NEW: sns-publish-batch-failed-not-checked
// PublishBatchCommand response.Failed not inspected
// ──────────────────────────────────────────────────

// @expect-violation: sns-publish-batch-failed-not-checked
async function gt_publishBatch_failedNotChecked() {
  // SHOULD_FIRE: response.Failed is never checked — silent message loss possible
  const response = await snsClient.send(new PublishBatchCommand({
    TopicArn: TOPIC_ARN,
    PublishBatchRequestEntries: [
      { Id: '1', Message: 'notification 1' },
      { Id: '2', Message: 'notification 2' },
      { Id: '3', Message: 'notification 3' },
    ],
  }));
  // Caller uses response.Successful but ignores response.Failed
  console.log(`Published ${response.Successful?.length} messages`);
  // response.Failed is never checked — some messages may have silently failed
}

// @expect-clean
async function gt_publishBatch_failedChecked() {
  // SHOULD_NOT_FIRE: response.Failed is inspected and handled; also wrapped in try-catch
  try {
    const response = await snsClient.send(new PublishBatchCommand({
      TopicArn: TOPIC_ARN,
      PublishBatchRequestEntries: [
        { Id: '1', Message: 'notification 1' },
        { Id: '2', Message: 'notification 2' },
      ],
    }));
    if (response.Failed && response.Failed.length > 0) {
      const retryable = response.Failed.filter((f) => !f.SenderFault);
      const permanent = response.Failed.filter((f) => f.SenderFault);
      if (permanent.length > 0) {
        throw new Error(`Permanent batch failures: ${permanent.map((f) => `${f.Id}: ${f.Code}`).join(', ')}`);
      }
      if (retryable.length > 0) {
        console.warn('Retryable batch failures, will retry:', retryable.map((f) => f.Id));
      }
    }
    return response.Successful;
  } catch (error) {
    if (error instanceof SNSServiceException) {
      console.error(`SNS batch error [${error.name}]:`, error.message);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// NEW: sns-subscribe-pending-confirmation-not-handled
// SubscribeCommand returns "pending confirmation" — not checked
// ──────────────────────────────────────────────────

// @expect-violation: sns-subscribe-pending-confirmation-not-handled
async function gt_subscribe_pendingConfirmationNotChecked() {
  // SHOULD_FIRE: subscription ARN value is never checked — endpoint may not be active
  try {
    const response = await snsClient.send(new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: 'https',
      Endpoint: 'https://example.com/webhook',
    }));
    // response.SubscriptionArn may be "pending confirmation" — never checked
    console.log('Subscribed with ARN:', response.SubscriptionArn);
    return response.SubscriptionArn;
  } catch (error) {
    throw error;
  }
}

// @expect-clean
async function gt_subscribe_pendingConfirmationChecked() {
  // SHOULD_NOT_FIRE: subscription ARN is checked for pending state
  try {
    const response = await snsClient.send(new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: 'https',
      Endpoint: 'https://example.com/webhook',
    }));
    if (response.SubscriptionArn === 'pending confirmation') {
      // Endpoint must confirm — subscription not yet active
      console.log('Subscription pending confirmation from endpoint');
      return null;
    }
    return response.SubscriptionArn;
  } catch (error) {
    if (error instanceof SNSServiceException) {
      if (error.name === 'SubscriptionLimitExceeded') {
        throw new Error('SNS subscription limit reached — contact ops team');
      }
    }
    throw error;
  }
}
