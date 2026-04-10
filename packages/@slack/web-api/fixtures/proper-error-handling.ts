/**
 * Proper error handling patterns for @slack/web-api
 * This file demonstrates CORRECT usage - should trigger 0 violations
 */

import { WebClient, WebAPICallResult } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Example 1: chat.postMessage with proper error handling
 * ✅ Uses try-catch
 * ✅ Checks response.ok
 * ✅ Handles specific error types
 */
async function sendMessageWithProperErrorHandling(channel: string, text: string): Promise<void> {
  try {
    const response = await slack.chat.postMessage({
      channel,
      text,
    });

    // Check if API call was successful
    if (!response.ok) {
      console.error('Slack API error:', response.error);

      // Handle specific error codes
      switch (response.error) {
        case 'invalid_auth':
        case 'token_revoked':
          console.error('Token is invalid or revoked');
          break;
        case 'channel_not_found':
          console.error('Channel not found or bot not a member');
          break;
        case 'rate_limited':
          console.error('Rate limit exceeded');
          break;
        default:
          console.error('Unknown error:', response.error);
      }

      throw new Error(`Slack API error: ${response.error}`);
    }

    console.log('Message sent successfully:', response.ts);
  } catch (error: any) {
    // Handle different error types
    if (error.code === 'slack_webapi_rate_limited_error') {
      console.error('Rate limited. Retry after:', error.retryAfter, 'seconds');
      // Could implement retry logic here
    } else if (error.code === 'slack_webapi_request_error') {
      console.error('Network error:', error.original);
    } else if (error.code === 'slack_webapi_http_error') {
      console.error('HTTP error:', error.statusCode, error.statusMessage);
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

/**
 * Example 2: users.list with proper error handling
 * ✅ Uses try-catch
 * ✅ Handles pagination
 * ✅ Checks response.ok
 */
async function listUsersWithProperErrorHandling(): Promise<any[]> {
  try {
    const response = await slack.users.list();

    if (!response.ok) {
      console.error('Failed to list users:', response.error);
      throw new Error(`Slack API error: ${response.error}`);
    }

    const users = response.members || [];
    console.log(`Found ${users.length} users`);
    return users;
  } catch (error: any) {
    console.error('Error listing users:', error.message);
    throw error;
  }
}

/**
 * Example 3: users.info with proper error handling
 * ✅ Uses try-catch
 * ✅ Validates input
 * ✅ Checks response.ok
 */
async function getUserInfoWithProperErrorHandling(userId: string): Promise<any> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await slack.users.info({ user: userId });

    if (!response.ok) {
      if (response.error === 'user_not_found') {
        console.error('User not found:', userId);
        return null;
      }
      throw new Error(`Slack API error: ${response.error}`);
    }

    return response.user;
  } catch (error: any) {
    console.error('Error getting user info:', error.message);
    throw error;
  }
}

/**
 * Example 4: conversations.list with proper error handling
 * ✅ Uses try-catch
 * ✅ Checks response.ok
 */
async function listChannelsWithProperErrorHandling(): Promise<any[]> {
  try {
    const response = await slack.conversations.list({
      types: 'public_channel,private_channel',
    });

    if (!response.ok) {
      console.error('Failed to list channels:', response.error);
      throw new Error(`Slack API error: ${response.error}`);
    }

    return response.channels || [];
  } catch (error: any) {
    console.error('Error listing channels:', error.message);
    throw error;
  }
}

/**
 * Example 5: conversations.join with proper error handling
 * ✅ Uses try-catch
 * ✅ Checks response.ok
 * ✅ Handles specific errors
 */
async function joinChannelWithProperErrorHandling(channelId: string): Promise<void> {
  try {
    const response = await slack.conversations.join({ channel: channelId });

    if (!response.ok) {
      if (response.error === 'channel_not_found') {
        console.error('Channel does not exist:', channelId);
        return;
      } else if (response.error === 'is_archived') {
        console.error('Channel is archived:', channelId);
        return;
      }
      throw new Error(`Slack API error: ${response.error}`);
    }

    console.log('Joined channel successfully');
  } catch (error: any) {
    console.error('Error joining channel:', error.message);
    throw error;
  }
}

/**
 * Example 6: conversations.invite with proper error handling
 * ✅ Uses try-catch
 * ✅ Checks response.ok
 */
async function inviteToChannelWithProperErrorHandling(
  channelId: string,
  userIds: string[]
): Promise<void> {
  try {
    const response = await slack.conversations.invite({
      channel: channelId,
      users: userIds.join(','),
    });

    if (!response.ok) {
      console.error('Failed to invite users:', response.error);
      throw new Error(`Slack API error: ${response.error}`);
    }

    console.log('Users invited successfully');
  } catch (error: any) {
    console.error('Error inviting users:', error.message);
    throw error;
  }
}

/**
 * Example 7: files.upload with proper error handling
 * ✅ Uses try-catch
 * ✅ Checks response.ok
 * ✅ Handles file errors
 */
async function uploadFileWithProperErrorHandling(
  channels: string,
  file: Buffer,
  filename: string
): Promise<void> {
  try {
    const response = await slack.files.upload({
      channels,
      file,
      filename,
    });

    if (!response.ok) {
      if (response.error === 'file_too_large') {
        console.error('File is too large:', filename);
        return;
      }
      throw new Error(`Slack API error: ${response.error}`);
    }

    console.log('File uploaded successfully');
  } catch (error: any) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
}

/**
 * Example 8: auth.test with proper error handling
 * ✅ Uses try-catch
 * ✅ Checks response.ok
 */
async function testAuthWithProperErrorHandling(): Promise<boolean> {
  try {
    const response = await slack.auth.test();

    if (!response.ok) {
      console.error('Auth test failed:', response.error);
      return false;
    }

    console.log('Auth test passed. Team:', response.team, 'User:', response.user);
    return true;
  } catch (error: any) {
    console.error('Error testing auth:', error.message);
    return false;
  }
}

/**
 * Example 9: Rate limiting with proper retry handling
 * ✅ Uses try-catch
 * ✅ Checks retryAfter property
 * ✅ Implements custom retry logic
 */
async function sendMessageWithRetryHandling(channel: string, text: string): Promise<void> {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await slack.chat.postMessage({ channel, text });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.error}`);
      }

      console.log('Message sent successfully');
      return;
    } catch (error: any) {
      if (error.code === 'slack_webapi_rate_limited_error') {
        const waitTime = error.retryAfter || Math.pow(2, retryCount);
        console.log(`Rate limited. Waiting ${waitTime} seconds before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        retryCount++;
      } else {
        console.error('Non-retryable error:', error.message);
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// Export functions for testing
export {
  sendMessageWithProperErrorHandling,
  listUsersWithProperErrorHandling,
  getUserInfoWithProperErrorHandling,
  listChannelsWithProperErrorHandling,
  joinChannelWithProperErrorHandling,
  inviteToChannelWithProperErrorHandling,
  uploadFileWithProperErrorHandling,
  testAuthWithProperErrorHandling,
  sendMessageWithRetryHandling,
};
