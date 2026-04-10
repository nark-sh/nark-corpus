/**
 * Missing error handling patterns for @slack/web-api
 * This file demonstrates INCORRECT usage - should trigger violations
 */

import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * VIOLATION 1: chat.postMessage without try-catch
 * ❌ No try-catch block
 * ❌ Does not check response.ok
 * Should trigger: missing-error-handling (ERROR)
 */
async function sendMessageWithoutErrorHandling(channel: string, text: string): Promise<void> {
  // ❌ No try-catch - can throw RequestError, RateLimitedError, HTTPError
  const response = await slack.chat.postMessage({
    channel,
    text,
  });

  // ❌ Does not check response.ok
  console.log('Message sent:', response.ts);
}

/**
 * VIOLATION 2: users.list without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function listUsersWithoutErrorHandling(): Promise<any[]> {
  // ❌ No try-catch
  const response = await slack.users.list();

  // ❌ Does not check response.ok
  return response.members || [];
}

/**
 * VIOLATION 3: users.info without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function getUserInfoWithoutErrorHandling(userId: string): Promise<any> {
  // ❌ No try-catch
  const response = await slack.users.info({ user: userId });
  return response.user;
}

/**
 * VIOLATION 4: conversations.list without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function listChannelsWithoutErrorHandling(): Promise<any[]> {
  // ❌ No try-catch
  const response = await slack.conversations.list({
    types: 'public_channel,private_channel',
  });
  return response.channels || [];
}

/**
 * VIOLATION 5: conversations.join without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function joinChannelWithoutErrorHandling(channelId: string): Promise<void> {
  // ❌ No try-catch - can fail with channel_not_found, is_archived
  const response = await slack.conversations.join({ channel: channelId });
  console.log('Joined channel');
}

/**
 * VIOLATION 6: conversations.invite without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function inviteToChannelWithoutErrorHandling(
  channelId: string,
  userIds: string[]
): Promise<void> {
  // ❌ No try-catch
  const response = await slack.conversations.invite({
    channel: channelId,
    users: userIds.join(','),
  });
  console.log('Users invited');
}

/**
 * VIOLATION 7: files.upload without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function uploadFileWithoutErrorHandling(
  channels: string,
  file: Buffer,
  filename: string
): Promise<void> {
  // ❌ No try-catch - can fail with file_too_large
  const response = await slack.files.upload({
    channels,
    file,
    filename,
  });
  console.log('File uploaded');
}

/**
 * VIOLATION 8: auth.test without error handling
 * ❌ No try-catch block
 * Should trigger: missing-error-handling (ERROR)
 */
async function testAuthWithoutErrorHandling(): Promise<boolean> {
  // ❌ No try-catch
  const response = await slack.auth.test();
  return response.ok;
}

/**
 * VIOLATION 9: Multiple calls without error handling
 * ❌ No try-catch on any call
 * Should trigger: multiple violations
 */
async function sendNotificationWithoutErrorHandling(
  userId: string,
  message: string
): Promise<void> {
  // ❌ No try-catch on users.info
  const user = await slack.users.info({ user: userId });

  if (!user.user) {
    return;
  }

  // ❌ No try-catch on chat.postMessage
  await slack.chat.postMessage({
    channel: userId,
    text: message,
  });
}

/**
 * VIOLATION 10: Promise chain without error handling
 * ❌ No catch() on promise chain
 * Should trigger: missing-error-handling (ERROR)
 */
function sendMessagePromiseChain(channel: string, text: string): Promise<any> {
  // ❌ No .catch() on promise chain
  return slack.chat.postMessage({ channel, text })
    .then(response => {
      console.log('Message sent:', response.ts);
      return response;
    });
}

/**
 * VIOLATION 11: Fire-and-forget pattern
 * ❌ No await, no error handling
 * Should trigger: missing-error-handling (ERROR)
 */
function fireAndForgetMessage(channel: string, text: string): void {
  // ❌ Not awaited, no error handling
  slack.chat.postMessage({ channel, text });
  console.log('Message sent (not really awaited)');
}

/**
 * VIOLATION 12: Partial error handling (only checks response.ok)
 * ❌ No try-catch for network/rate limit errors
 * Should trigger: missing-error-handling (ERROR)
 */
async function partialErrorHandling(channel: string, text: string): Promise<void> {
  // ❌ No try-catch - will crash on network errors
  const response = await slack.chat.postMessage({ channel, text });

  // ✅ Checks response.ok (good!)
  if (!response.ok) {
    console.error('API error:', response.error);
    throw new Error(response.error);
  }
}

// Export functions for testing
export {
  sendMessageWithoutErrorHandling,
  listUsersWithoutErrorHandling,
  getUserInfoWithoutErrorHandling,
  listChannelsWithoutErrorHandling,
  joinChannelWithoutErrorHandling,
  inviteToChannelWithoutErrorHandling,
  uploadFileWithoutErrorHandling,
  testAuthWithoutErrorHandling,
  sendNotificationWithoutErrorHandling,
  sendMessagePromiseChain,
  fireAndForgetMessage,
  partialErrorHandling,
};
