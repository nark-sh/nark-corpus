import {
  SNSClient,
  PublishCommand,
  CreateTopicCommand,
} from '@aws-sdk/client-sns';

/**
 * Tests detection via class instance variable patterns.
 */

// ── Pattern 1: Instance as class property ───────────────────────────────

class NotificationService {
  private readonly snsClient = new SNSClient({ region: 'us-east-1' });
  private readonly topicArn: string;

  constructor(topicArn: string) {
    this.topicArn = topicArn;
  }

  /**
   * VIOLATION: this.snsClient.send() without try-catch
   */
  async notify(message: string): Promise<string | undefined> {
    const response = await this.snsClient.send(new PublishCommand({
      TopicArn: this.topicArn,
      Message: message,
    }));
    return response.MessageId;
  }
}

// ── Pattern 2: Module-level instance ────────────────────────────────────

const globalSnsClient = new SNSClient({ region: 'eu-west-1' });

/**
 * VIOLATION: globalSnsClient.send() without try-catch
 */
async function publishToGlobalTopic(topicArn: string, msg: string) {
  await globalSnsClient.send(new PublishCommand({
    TopicArn: topicArn,
    Message: msg,
  }));
}

// ── Pattern 3: Factory function returning client ─────────────────────────

function createSNSClient(region: string): SNSClient {
  return new SNSClient({ region });
}

const regionalClient = createSNSClient('ap-southeast-1');

/**
 * VIOLATION: factory-created client without try-catch
 */
async function createTopicInRegion(name: string) {
  const response = await regionalClient.send(new CreateTopicCommand({ Name: name }));
  return response.TopicArn;
}
