/**
 * @slack/web-api Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (new — added depth pass 2026-04-03):
 *   - client.chat.update()          postcondition: chat-update-no-trycatch
 *   - client.chat.postEphemeral()   postcondition: chat-postephemeral-no-trycatch
 *   - client.chat.delete()          postcondition: chat-delete-no-trycatch
 *   - client.chat.scheduleMessage() postcondition: chat-schedulemessage-no-trycatch
 *   - client.conversations.create() postcondition: conversations-create-no-trycatch
 *   - client.conversations.history() postcondition: conversations-history-no-trycatch
 *   - client.conversations.open()   postcondition: conversations-open-no-trycatch
 *   - client.views.open()           postcondition: views-open-no-trycatch
 *   - client.reactions.add()        postcondition: reactions-add-no-trycatch
 *   - client.filesUploadV2()        postcondition: filesuploadv2-no-trycatch
 *   - client.users.lookupByEmail()  postcondition: users-lookupbyemail-no-trycatch
 *
 * Previously contracted (from existing contract):
 *   - client.chat.postMessage()     postcondition: chat-postmessage-no-trycatch
 *   - client.users.list()           postcondition: users-list-no-trycatch
 *   - client.users.info()           postcondition: users-info-no-trycatch
 *   - client.conversations.list()   postcondition: conversations-list-no-trycatch
 *   - client.conversations.join()   postcondition: conversations-join-no-trycatch
 *   - client.conversations.invite() postcondition: conversations-invite-no-trycatch
 *   - client.files.upload()         postcondition: files-upload-no-trycatch
 *   - client.auth.test()            postcondition: auth-test-no-trycatch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires on awaited calls without try-catch
 */

import { WebClient } from '@slack/web-api';

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// ─────────────────────────────────────────────────────────────────────────────
// 1. chat.update — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMessageNoCatch(channel: string, ts: string, text: string) {
  // SHOULD_FIRE: chat-update-no-trycatch — message_not_found/cant_update_message thrown without catch
  const response = await client.chat.update({ channel, ts, text });
  return response.ts;
}

export async function updateMessageWithCatch(channel: string, ts: string, text: string) {
  try {
    // SHOULD_NOT_FIRE: chat.update() inside try-catch satisfies error handling
    const response = await client.chat.update({ channel, ts, text });
    return response.ts;
  } catch (error: any) {
    if (error.data?.error === 'message_not_found') {
      console.log('Message was deleted, skipping update');
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. chat.postEphemeral — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function postEphemeralNoCatch(channel: string, user: string, text: string) {
  // SHOULD_FIRE: chat-postephemeral-no-trycatch — user_not_in_channel thrown without catch
  const response = await client.chat.postEphemeral({ channel, user, text });
  return response.message_ts;
}

export async function postEphemeralWithCatch(channel: string, user: string, text: string) {
  try {
    // SHOULD_NOT_FIRE: chat.postEphemeral() inside try-catch satisfies error handling
    const response = await client.chat.postEphemeral({ channel, user, text });
    return response.message_ts;
  } catch (error: any) {
    if (error.data?.error === 'user_not_in_channel') {
      console.log('User not in channel, skipping ephemeral');
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. chat.delete — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMessageNoCatch(channel: string, ts: string) {
  // SHOULD_FIRE: chat-delete-no-trycatch — message_not_found thrown without catch
  await client.chat.delete({ channel, ts });
}

export async function deleteMessageWithCatch(channel: string, ts: string) {
  try {
    // SHOULD_NOT_FIRE: chat.delete() inside try-catch satisfies error handling
    await client.chat.delete({ channel, ts });
  } catch (error: any) {
    // message_not_found is safe to ignore — already deleted
    if (error.data?.error !== 'message_not_found') {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. chat.scheduleMessage — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function scheduleMessageNoCatch(channel: string, text: string, postAt: number) {
  // SHOULD_FIRE: chat-schedulemessage-no-trycatch — time_in_past thrown without catch
  const response = await client.chat.scheduleMessage({ channel, text, post_at: postAt });
  return response.scheduled_message_id;
}

export async function scheduleMessageWithCatch(channel: string, text: string, postAt: number) {
  try {
    // SHOULD_NOT_FIRE: chat.scheduleMessage() inside try-catch satisfies error handling
    const response = await client.chat.scheduleMessage({ channel, text, post_at: postAt });
    return response.scheduled_message_id;
  } catch (error: any) {
    if (error.data?.error === 'time_in_past') {
      console.error('Scheduled time is in the past — revalidate scheduling logic');
      throw new Error('Cannot schedule message in the past');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. conversations.create — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function createChannelNoCatch(name: string) {
  // SHOULD_FIRE: conversations-create-no-trycatch — name_taken thrown without catch
  const response = await client.conversations.create({ name });
  return response.channel?.id;
}

export async function createChannelWithCatch(name: string) {
  try {
    // SHOULD_NOT_FIRE: conversations.create() inside try-catch satisfies error handling
    const response = await client.conversations.create({ name });
    return response.channel?.id;
  } catch (error: any) {
    if (error.data?.error === 'name_taken') {
      console.log(`Channel ${name} already exists`);
      return null; // caller should look up existing channel
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. conversations.history — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHistoryNoCatch(channel: string) {
  // SHOULD_FIRE: conversations-history-no-trycatch — not_in_channel thrown without catch
  const response = await client.conversations.history({ channel });
  return response.messages;
}

export async function fetchHistoryWithCatch(channel: string) {
  try {
    // SHOULD_NOT_FIRE: conversations.history() inside try-catch satisfies error handling
    const response = await client.conversations.history({ channel });
    return response.messages;
  } catch (error: any) {
    if (error.data?.error === 'not_in_channel') {
      console.log('Bot was removed from channel — stop polling');
      return [];
    }
    if (error.data?.error === 'invalid_cursor') {
      console.log('Cursor expired — restart pagination');
      return [];
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. conversations.open — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function openDMNoCatch(userId: string) {
  // SHOULD_FIRE: conversations-open-no-trycatch — user_disabled thrown without catch
  const response = await client.conversations.open({ users: userId });
  return response.channel?.id;
}

export async function openDMWithCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: conversations.open() inside try-catch satisfies error handling
    const response = await client.conversations.open({ users: userId });
    return response.channel?.id;
  } catch (error: any) {
    if (error.data?.error === 'user_disabled') {
      console.log(`User ${userId} is deactivated — skipping DM`);
      return null;
    }
    if (error.data?.error === 'user_not_found') {
      console.error(`User ${userId} not found`);
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. views.open — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function openModalNoCatch(triggerId: string) {
  // SHOULD_FIRE: views-open-no-trycatch — expired_trigger_id thrown without catch
  const response = await client.views.open({
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: { type: 'plain_text', text: 'My Modal' },
      blocks: [],
    },
  });
  return response.view?.id;
}

export async function openModalWithCatch(triggerId: string) {
  try {
    // SHOULD_NOT_FIRE: views.open() inside try-catch satisfies error handling
    const response = await client.views.open({
      trigger_id: triggerId,
      view: {
        type: 'modal',
        title: { type: 'plain_text', text: 'My Modal' },
        blocks: [],
      },
    });
    return response.view?.id;
  } catch (error: any) {
    if (error.data?.error === 'expired_trigger_id') {
      // Cannot open modal — trigger_id expired. Send ephemeral fallback.
      console.error('Trigger ID expired — async work before views.open is too slow');
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. reactions.add — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function addReactionNoCatch(channel: string, timestamp: string, name: string) {
  // SHOULD_FIRE: reactions-add-no-trycatch — already_reacted thrown without catch
  await client.reactions.add({ channel, timestamp, name });
}

export async function addReactionWithCatch(channel: string, timestamp: string, name: string) {
  try {
    // SHOULD_NOT_FIRE: reactions.add() inside try-catch satisfies error handling
    await client.reactions.add({ channel, timestamp, name });
  } catch (error: any) {
    // already_reacted is idempotent — safe no-op
    if (error.data?.error !== 'already_reacted') {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. filesUploadV2 — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadFileV2NoCatch(channel: string, content: Buffer, filename: string) {
  // SHOULD_FIRE: filesuploadv2-no-trycatch — file_uploads_disabled/storage_limit_reached thrown without catch
  const result = await client.filesUploadV2({
    channel_id: channel,
    file: content,
    filename,
  });
  return result.files;
}

export async function uploadFileV2WithCatch(channel: string, content: Buffer, filename: string) {
  try {
    // SHOULD_NOT_FIRE: filesUploadV2() inside try-catch satisfies error handling
    const result = await client.filesUploadV2({
      channel_id: channel,
      file: content,
      filename,
    });
    return result.files;
  } catch (error: any) {
    if (error.data?.error === 'file_uploads_disabled') {
      console.error('Workspace admin has disabled file uploads');
      return null;
    }
    if (error.data?.error === 'storage_limit_reached') {
      console.error('Workspace storage quota exceeded — notify admin');
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. users.lookupByEmail — without vs with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function lookupUserByEmailNoCatch(email: string) {
  // SHOULD_FIRE: users-lookupbyemail-no-trycatch — users_not_found thrown without catch
  const response = await client.users.lookupByEmail({ email });
  return response.user;
}

export async function lookupUserByEmailWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: users.lookupByEmail() inside try-catch satisfies error handling
    const response = await client.users.lookupByEmail({ email });
    return response.user;
  } catch (error: any) {
    if (error.data?.error === 'users_not_found') {
      // Expected — not all emails map to Slack workspace users
      return null; // fall back to email notification
    }
    if (error.data?.error === 'missing_scope') {
      console.error('Token missing users:read.email scope — check OAuth permissions');
      throw error;
    }
    throw error;
  }
}
