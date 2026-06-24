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
 *   sns-publish-endpoint-disabled-not-handled    (PublishCommand — EndpointDisabled not routed to dereg flow)
 *   sns-publish-kms-error-not-handled            (PublishCommand — KMS* errors not split from auth errors)
 *   sns-confirm-subscription-replay-limit-exceeded (ConfirmSubscriptionCommand — replay token not detected)
 *   sns-confirm-subscription-token-invalid-not-handled (ConfirmSubscriptionCommand — expired token not surfaced)
 */
import {
  SNSClient,
  PublishCommand,
  PublishBatchCommand,
  CreateTopicCommand,
  DeleteTopicCommand,
  SubscribeCommand,
  ConfirmSubscriptionCommand,
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

// @expect-clean
async function gt_publishBatch_failedNotChecked() {
  // SHOULD_NOT_FIRE: scanner gap — return-value postcondition sns-publish-batch-failed-not-checked not implemented
  // Wrapped in try-catch to avoid aws-sns-service-error; the gap is response.Failed not checked
  try {
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
  } catch (err) {
    throw err;
  }
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

// @expect-clean
async function gt_subscribe_pendingConfirmationNotChecked() {
  // SHOULD_NOT_FIRE: scanner gap — return-value postcondition sns-subscribe-pending-confirmation-not-handled not implemented
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

// ──────────────────────────────────────────────────
// 9. PublishCommand — EndpointDisabled not routed to dereg flow (scanner gap, no detector yet)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_publish_endpoint_disabled_swallowed() {
  const endpointArn = 'arn:aws:sns:us-east-1:123456789:endpoint/APNS/MyApp/abc';
  try {
    // SHOULD_NOT_FIRE: scanner gap — error-name-narrowing postcondition sns-publish-endpoint-disabled-not-handled not implemented
    await snsClient.send(new PublishCommand({
      TargetArn: endpointArn,
      Message: 'push payload',
    }));
  } catch (error) {
    // Generic catch — does not split EndpointDisabled or PlatformApplicationDisabled
    console.error('publish failed:', error);
  }
}

// @expect-clean
async function gt_publish_endpoint_disabled_handled() {
  const endpointArn = 'arn:aws:sns:us-east-1:123456789:endpoint/APNS/MyApp/abc';
  try {
    // SHOULD_NOT_FIRE: EndpointDisabled routed to deregistration flow
    await snsClient.send(new PublishCommand({
      TargetArn: endpointArn,
      Message: 'push payload',
    }));
  } catch (error) {
    if (error instanceof SNSServiceException) {
      if (error.name === 'EndpointDisabled') {
        await markEndpointDisabled(endpointArn);
        return;
      }
      if (error.name === 'PlatformApplicationDisabled') {
        await alertOps('Platform application disabled');
        return;
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 10. PublishCommand — KMS error swallowed as generic auth error (scanner gap, no detector yet)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_publish_kms_error_collapsed() {
  try {
    // SHOULD_NOT_FIRE: scanner gap — error-name-narrowing postcondition sns-publish-kms-error-not-handled not implemented
    await snsClient.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: 'encrypted message',
    }));
  } catch (error) {
    if (error instanceof SNSServiceException) {
      // BAD: lumps KMS errors with authorization — operator chases SNS IAM
      if (error.name === 'AuthorizationError' || error.name.startsWith('KMS')) {
        throw new Error('permission error');
      }
    }
    throw error;
  }
}

// @expect-clean
async function gt_publish_kms_error_handled() {
  try {
    // SHOULD_NOT_FIRE: KMS family split from auth and throttling retried
    await snsClient.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: 'encrypted message',
    }));
  } catch (error) {
    if (error instanceof SNSServiceException) {
      if (error.name.startsWith('KMS')) {
        if (error.name === 'KMSThrottling') {
          // transient — let caller retry
          throw new Error('kms throttling');
        }
        await alertOps(`KMS key unavailable: ${error.name}`);
        throw new Error('kms key unavailable');
      }
      if (error.name === 'AuthorizationError') {
        throw new Error('sns publish permission denied');
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 11. ConfirmSubscriptionCommand — replay limit ignored (scanner gap, no detector yet)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_confirm_replay_limit_ignored() {
  const token = 'abc123';
  try {
    // SHOULD_NOT_FIRE: scanner gap — error-name-narrowing postcondition sns-confirm-subscription-replay-limit-exceeded not implemented
    await snsClient.send(new ConfirmSubscriptionCommand({
      TopicArn: TOPIC_ARN,
      Token: token,
    }));
  } catch (error) {
    // Generic catch — does not split ReplayLimitExceeded; webhook returns 200 to SNS
    console.error('confirm failed:', error);
  }
}

// @expect-clean
async function gt_confirm_replay_limit_handled() {
  const token = 'abc123';
  try {
    // SHOULD_NOT_FIRE: ReplayLimitExceeded triggers re-subscription flow
    await snsClient.send(new ConfirmSubscriptionCommand({
      TopicArn: TOPIC_ARN,
      Token: token,
    }));
  } catch (error) {
    if (error instanceof SNSServiceException) {
      if (error.name === 'ReplayLimitExceeded') {
        await logSecurityEvent('replay limit hit', { TopicArn: TOPIC_ARN });
        await triggerResubscriptionFlow(TOPIC_ARN);
        return;
      }
      if (error.name === 'InvalidParameter') {
        await notifyUser('Confirmation expired — please re-subscribe');
        return;
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 12. ConfirmSubscriptionCommand — invalid/expired token swallowed (scanner gap, no detector yet)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_confirm_invalid_token_swallowed() {
  const token = 'expired-token';
  try {
    // SHOULD_NOT_FIRE: scanner gap — error-name-narrowing postcondition sns-confirm-subscription-token-invalid-not-handled not implemented
    await snsClient.send(new ConfirmSubscriptionCommand({
      TopicArn: TOPIC_ARN,
      Token: token,
    }));
  } catch (error) {
    // Generic catch — InvalidParameter on confirm = user must re-subscribe
    console.error('confirm error:', error);
  }
}

// @expect-clean
async function gt_confirm_invalid_token_surfaced() {
  const token = 'expired-token';
  try {
    // SHOULD_NOT_FIRE: InvalidParameter on confirm routed to "please re-subscribe" UX
    await snsClient.send(new ConfirmSubscriptionCommand({
      TopicArn: TOPIC_ARN,
      Token: token,
    }));
    return { ok: true };
  } catch (error) {
    if (error instanceof SNSServiceException && error.name === 'InvalidParameter') {
      return { ok: false, reason: 'token_expired_or_invalid' };
    }
    throw error;
  }
}

// Helper stubs for fixture compilation
async function markEndpointDisabled(_arn: string) {}
async function alertOps(_msg: string) {}
async function logSecurityEvent(_msg: string, _ctx: Record<string, unknown>) {}
async function triggerResubscriptionFlow(_arn: string) {}
async function notifyUser(_msg: string) {}
