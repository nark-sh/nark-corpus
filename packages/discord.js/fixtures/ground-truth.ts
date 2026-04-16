/**
 * discord.js Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "discord.js"):
 *   - message.delete()         postcondition: discord-message-delete-no-try-catch
 *   - message.reply()          postcondition: discord-message-reply-no-try-catch
 *   - webhook.send()           postcondition: discord-webhook-send-no-try-catch
 *   - member.createDM()        postcondition: discord-guildmember-createdm-no-try-catch
 *   - channel.delete()         postcondition: discord-guildchannel-delete-no-try-catch
 *   - member.setNickname()     postcondition: discord-guildmember-setnickname-no-try-catch
 *   - thread.setArchived()     postcondition: discord-threadchannel-setarchived-no-try-catch
 *
 * Detection path: type_name → InstanceTracker tracks instance →
 *   ThrowingFunctionDetector fires method →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { Message, Webhook, GuildMember, GuildChannel, ThreadChannel } from 'discord.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. message.delete() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMessageNoCatch(message: Message) {
  // SHOULD_FIRE: discord-message-delete-no-try-catch — message.delete() throws on API errors. No try-catch.
  await message.delete();
}

export async function deleteMessageWithCatch(message: Message) {
  try {
    // SHOULD_NOT_FIRE: message.delete() inside try-catch satisfies error handling
    await message.delete();
  } catch (err) {
    console.error('Delete failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. message.reply() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function replyNoCatch(message: Message) {
  // SHOULD_FIRE: discord-message-reply-no-try-catch — message.reply() throws on API errors. No try-catch.
  await message.reply('Hello!');
}

export async function replyWithCatch(message: Message) {
  try {
    // SHOULD_NOT_FIRE: message.reply() inside try-catch satisfies error handling
    await message.reply('Hello!');
  } catch (err) {
    console.error('Reply failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. webhook.send() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-webhook-send-no-try-catch
export async function webhookSendNoCatch(webhook: Webhook) {
  // SHOULD_FIRE: discord-webhook-send-no-try-catch — throws DiscordAPIError on invalid token/permissions.
  await webhook.send({ content: 'Hello from webhook!' });
}

// @expect-clean
export async function webhookSendWithCatch(webhook: Webhook) {
  try {
    // SHOULD_NOT_FIRE: webhook.send() inside try-catch satisfies error handling
    await webhook.send({ content: 'Hello from webhook!' });
  } catch (err) {
    console.error('Webhook send failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GuildMember.createDM() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-guildmember-createdm-no-try-catch
export async function createDMNoCatch(member: GuildMember) {
  // SHOULD_FIRE: discord-guildmember-createdm-no-try-catch — throws 50007 when user has DMs disabled.
  const dmChannel = await member.createDM();
  await dmChannel.send('You have been warned.');
}

// @expect-clean
export async function createDMWithCatch(member: GuildMember) {
  try {
    // SHOULD_NOT_FIRE: createDM() inside try-catch satisfies error handling
    const dmChannel = await member.createDM();
    await dmChannel.send('You have been warned.');
  } catch (err: any) {
    // 50007 = Cannot send messages to this user (DMs disabled)
    if (err?.code === 50007) {
      console.log('User has DMs disabled, skipping notification.');
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GuildChannel.delete() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-guildchannel-delete-no-try-catch
export async function deleteChannelNoCatch(channel: GuildChannel) {
  // SHOULD_FIRE: discord-guildchannel-delete-no-try-catch — throws on missing MANAGE_CHANNELS.
  await channel.delete('Cleanup');
}

// @expect-clean
export async function deleteChannelWithCatch(channel: GuildChannel) {
  try {
    // SHOULD_NOT_FIRE: channel.delete() inside try-catch satisfies error handling
    await channel.delete('Cleanup');
  } catch (err: any) {
    if (err?.code === 10003) {
      console.log('Channel already deleted.');
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GuildMember.setNickname() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-guildmember-setnickname-no-try-catch
export async function setNicknameNoCatch(member: GuildMember) {
  // SHOULD_FIRE: discord-guildmember-setnickname-no-try-catch — throws on missing MANAGE_NICKNAMES.
  await member.setNickname('Verified User');
}

// @expect-clean
export async function setNicknameWithCatch(member: GuildMember) {
  try {
    // SHOULD_NOT_FIRE: setNickname() inside try-catch satisfies error handling
    await member.setNickname('Verified User');
  } catch (err) {
    console.error('Failed to set nickname:', err);
    // Continue without nickname
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ThreadChannel.setArchived() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-threadchannel-setarchived-no-try-catch
export async function archiveThreadNoCatch(thread: ThreadChannel) {
  // SHOULD_FIRE: discord-threadchannel-setarchived-no-try-catch — throws on missing MANAGE_THREADS.
  await thread.setArchived(true);
}

// @expect-clean
export async function archiveThreadWithCatch(thread: ThreadChannel) {
  try {
    // SHOULD_NOT_FIRE: setArchived() inside try-catch satisfies error handling
    await thread.setArchived(true);
  } catch (err: any) {
    if (err?.code === 40060) {
      console.log('Thread is locked, cannot archive.');
    } else {
      throw err;
    }
  }
}
