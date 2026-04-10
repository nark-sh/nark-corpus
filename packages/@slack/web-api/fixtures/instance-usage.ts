/**
 * Instance usage patterns for @slack/web-api
 * Tests detection of Slack API calls via WebClient instances
 */

import { WebClient } from '@slack/web-api';

/**
 * Example 1: Instance stored in class property
 * ❌ Missing error handling on instance methods
 * Should trigger: missing-error-handling (ERROR)
 */
class SlackNotifier {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  // ❌ No try-catch on instance method
  async sendNotification(channel: string, message: string): Promise<void> {
    const response = await this.client.chat.postMessage({
      channel,
      text: message,
    });
    console.log('Notification sent:', response.ts);
  }

  // ❌ No try-catch on instance method
  async listMembers(): Promise<any[]> {
    const response = await this.client.users.list();
    return response.members || [];
  }
}

/**
 * Example 2: Instance from factory function
 * ❌ Missing error handling
 * Should trigger: missing-error-handling (ERROR)
 */
function createSlackClient(token: string): WebClient {
  return new WebClient(token);
}

async function sendViaFactory(token: string, channel: string, text: string): Promise<void> {
  const client = createSlackClient(token);

  // ❌ No try-catch
  await client.chat.postMessage({ channel, text });
}

/**
 * Example 3: Instance stored in variable
 * ❌ Missing error handling
 * Should trigger: missing-error-handling (ERROR)
 */
async function instanceInVariable(): Promise<void> {
  const slackClient = new WebClient(process.env.SLACK_TOKEN!);

  // ❌ No try-catch
  await slackClient.chat.postMessage({
    channel: 'general',
    text: 'Hello world',
  });
}

/**
 * Example 4: Multiple instance calls without error handling
 * ❌ Multiple violations
 * Should trigger: multiple missing-error-handling violations
 */
class SlackService {
  private slack: WebClient;

  constructor(token: string) {
    this.slack = new WebClient(token);
  }

  // ❌ No try-catch
  async postMessage(channel: string, text: string): Promise<void> {
    await this.slack.chat.postMessage({ channel, text });
  }

  // ❌ No try-catch
  async getUser(userId: string): Promise<any> {
    const response = await this.slack.users.info({ user: userId });
    return response.user;
  }

  // ❌ No try-catch
  async listChannels(): Promise<any[]> {
    const response = await this.slack.conversations.list();
    return response.channels || [];
  }

  // ❌ No try-catch
  async joinChannel(channelId: string): Promise<void> {
    await this.slack.conversations.join({ channel: channelId });
  }

  // ❌ No try-catch
  async inviteUsers(channelId: string, userIds: string[]): Promise<void> {
    await this.slack.conversations.invite({
      channel: channelId,
      users: userIds.join(','),
    });
  }

  // ❌ No try-catch
  async uploadFile(channels: string, file: Buffer, filename: string): Promise<void> {
    await this.slack.files.upload({ channels, file, filename });
  }
}

/**
 * Example 5: Instance with proper error handling (should NOT trigger violations)
 * ✅ Has try-catch
 * Should trigger: 0 violations
 */
class ProperSlackService {
  private slack: WebClient;

  constructor(token: string) {
    this.slack = new WebClient(token);
  }

  // ✅ Has try-catch
  async postMessageSafely(channel: string, text: string): Promise<void> {
    try {
      const response = await this.slack.chat.postMessage({ channel, text });

      if (!response.ok) {
        throw new Error(`Slack error: ${response.error}`);
      }

      console.log('Message sent:', response.ts);
    } catch (error: any) {
      console.error('Failed to send message:', error.message);
      throw error;
    }
  }

  // ✅ Has try-catch
  async getUserSafely(userId: string): Promise<any> {
    try {
      const response = await this.slack.users.info({ user: userId });

      if (!response.ok) {
        throw new Error(`Slack error: ${response.error}`);
      }

      return response.user;
    } catch (error: any) {
      console.error('Failed to get user:', error.message);
      throw error;
    }
  }
}

/**
 * Example 6: Chained instance calls (property access chain)
 * ❌ No try-catch
 * Should trigger: missing-error-handling (ERROR)
 */
async function chainedInstanceCall(): Promise<void> {
  const api = { slack: new WebClient(process.env.SLACK_TOKEN!) };

  // ❌ No try-catch - chained property access
  await api.slack.chat.postMessage({
    channel: 'general',
    text: 'Test message',
  });
}

/**
 * Example 7: Instance from module export
 * ❌ No try-catch
 * Should trigger: missing-error-handling (ERROR)
 */
export const sharedSlackClient = new WebClient(process.env.SLACK_TOKEN!);

export async function sendViaSharedClient(channel: string, text: string): Promise<void> {
  // ❌ No try-catch on shared instance
  await sharedSlackClient.chat.postMessage({ channel, text });
}

/**
 * Example 8: Conditional instance creation
 * ❌ No try-catch
 * Should trigger: missing-error-handling (ERROR)
 */
async function conditionalInstance(token?: string): Promise<void> {
  const client = token
    ? new WebClient(token)
    : new WebClient(process.env.SLACK_TOKEN!);

  // ❌ No try-catch
  await client.chat.postMessage({
    channel: 'general',
    text: 'Message from conditional client',
  });
}

// Export classes and functions for testing
export {
  SlackNotifier,
  createSlackClient,
  sendViaFactory,
  instanceInVariable,
  SlackService,
  ProperSlackService,
  chainedInstanceCall,
  conditionalInstance,
};
