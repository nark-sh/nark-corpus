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

/**
 * CORRECT: Publish with try-catch
 */
async function publishMessageWithCatch(message: string) {
  try {
    const response = await snsClient.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: message,
    }));
    return response.MessageId;
  } catch (error) {
    if (error instanceof SNSServiceException) {
      console.error(`SNS error [${error.name}]: ${error.message}`);
    } else {
      console.error('Network error publishing message:', error);
    }
    throw error;
  }
}

/**
 * CORRECT: PublishBatch with try-catch + partial failure check
 */
async function publishBatchWithHandling(messages: string[]) {
  try {
    const response = await snsClient.send(new PublishBatchCommand({
      TopicArn: TOPIC_ARN,
      PublishBatchRequestEntries: messages.map((msg, i) => ({
        Id: String(i),
        Message: msg,
      })),
    }));
    if (response.Failed && response.Failed.length > 0) {
      console.warn(`${response.Failed.length} messages failed to publish`);
    }
    return response.Successful;
  } catch (error) {
    console.error('Failed to publish batch:', error);
    throw error;
  }
}

/**
 * CORRECT: CreateTopic with try-catch
 */
async function createTopicWithCatch(name: string) {
  try {
    const response = await snsClient.send(new CreateTopicCommand({ Name: name }));
    return response.TopicArn;
  } catch (error) {
    console.error('Failed to create SNS topic:', error);
    throw error;
  }
}

/**
 * CORRECT: DeleteTopic with graceful not-found handling
 */
async function deleteTopicWithCatch(topicArn: string) {
  try {
    await snsClient.send(new DeleteTopicCommand({ TopicArn: topicArn }));
  } catch (error) {
    if (error instanceof SNSServiceException && error.name === 'NotFound') {
      // Topic already deleted — idempotent
      return;
    }
    throw error;
  }
}

/**
 * CORRECT: Subscribe with try-catch
 */
async function subscribeWithCatch(endpoint: string) {
  try {
    const response = await snsClient.send(new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: 'https',
      Endpoint: endpoint,
    }));
    return response.SubscriptionArn;
  } catch (error) {
    console.error('Failed to subscribe to SNS topic:', error);
    throw error;
  }
}
