import {
  SNSClient,
  PublishCommand,
  PublishBatchCommand,
  CreateTopicCommand,
  DeleteTopicCommand,
  SubscribeCommand,
  UnsubscribeCommand,
} from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ region: 'us-east-1' });
const TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789:my-topic';

/**
 * VIOLATION: Publish without try-catch
 * Message silently dropped if SNS is unavailable, topic doesn't exist, or permission denied.
 */
async function publishMessageNoCatch(message: string) {
  const response = await snsClient.send(new PublishCommand({
    TopicArn: TOPIC_ARN,
    Message: message,
  }));
  return response.MessageId;
}

/**
 * VIOLATION: PublishBatch without try-catch
 * Entire batch silently lost if SNS returns auth error or network failure.
 */
async function publishBatchNoCatch(messages: string[]) {
  const response = await snsClient.send(new PublishBatchCommand({
    TopicArn: TOPIC_ARN,
    PublishBatchRequestEntries: messages.map((msg, i) => ({
      Id: String(i),
      Message: msg,
    })),
  }));
  return response.Successful;
}

/**
 * VIOLATION: CreateTopic without try-catch
 * Topic creation fails silently if unauthorized or rate limited.
 */
async function createTopicNoCatch(name: string) {
  const response = await snsClient.send(new CreateTopicCommand({ Name: name }));
  return response.TopicArn;
}

/**
 * VIOLATION: DeleteTopic without try-catch
 * Fails silently if topic doesn't exist or permission denied.
 */
async function deleteTopicNoCatch(topicArn: string) {
  await snsClient.send(new DeleteTopicCommand({ TopicArn: topicArn }));
}

/**
 * VIOLATION: Subscribe without try-catch
 * Subscription fails silently on auth error or invalid endpoint.
 */
async function subscribeNoCatch(endpoint: string) {
  const response = await snsClient.send(new SubscribeCommand({
    TopicArn: TOPIC_ARN,
    Protocol: 'https',
    Endpoint: endpoint,
  }));
  return response.SubscriptionArn;
}

/**
 * VIOLATION: Unsubscribe without try-catch
 */
async function unsubscribeNoCatch(subscriptionArn: string) {
  await snsClient.send(new UnsubscribeCommand({ SubscriptionArn: subscriptionArn }));
}
