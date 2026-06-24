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

// ─────────────────────────────────────────────────────────────────────────────
// 8. MessageManager.delete() — channel.messages.delete(id) — without try-catch
// Added 2026-06-24 deepen pass 35
// ─────────────────────────────────────────────────────────────────────────────

import type { TextChannel, GuildMember as GuildMember2, AutocompleteInteraction, ModalSubmitInteraction, Client } from 'discord.js';

// @expect-violation: discord-messagemanager-delete-no-try-catch
export async function deleteByManagerNoCatch(channel: TextChannel, messageId: string) {
  // SHOULD_FIRE: discord-messagemanager-delete-no-try-catch — throws 10008 if message gone.
  await channel.messages.delete(messageId);
}

// @expect-clean
export async function deleteByManagerWithCatch(channel: TextChannel, messageId: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    await channel.messages.delete(messageId);
  } catch (err: any) {
    if (err?.code === 10008) {
      // Already deleted — treat as success
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. MessageManager.fetch() — channel.messages.fetch(id) — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-messagemanager-fetch-no-try-catch
export async function fetchMessageNoCatch(channel: TextChannel, messageId: string) {
  // SHOULD_FIRE: discord-messagemanager-fetch-no-try-catch — throws 10008 / 50013.
  const msg = await channel.messages.fetch(messageId);
  return msg;
}

// @expect-clean
export async function fetchMessageWithCatch(channel: TextChannel, messageId: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    return await channel.messages.fetch(messageId);
  } catch (err) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. GuildMemberManager.fetch() — guild.members.fetch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-guildmembermanager-fetch-no-try-catch
export async function fetchMemberNoCatch(member: GuildMember2, userId: string) {
  // SHOULD_FIRE: discord-guildmembermanager-fetch-no-try-catch — throws 10007 if member left.
  await member.guild.members.fetch(userId);
}

// @expect-clean
export async function fetchMemberWithCatch(member: GuildMember2, userId: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    return await member.guild.members.fetch(userId);
  } catch (err: any) {
    if (err?.code === 10007) return null;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. GuildMemberManager.bulkBan() — without try-catch and ignoring partial failures
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-guildmembermanager-bulkban-no-try-catch
// @expect-violation: discord-guildmembermanager-bulkban-partial-failure-ignored
export async function bulkBanNoCatch(member: GuildMember2, userIds: string[]) {
  // SHOULD_FIRE: bulkban-no-try-catch — throws on hierarchy / empty list.
  // SHOULD_FIRE: bulkban-partial-failure-ignored — result.failedUsers not inspected.
  await member.guild.members.bulkBan(userIds, { deleteMessageSeconds: 0, reason: 'raid cleanup' });
}

// @expect-clean
export async function bulkBanWithCatch(member: GuildMember2, userIds: string[]) {
  if (userIds.length === 0) return;
  try {
    // SHOULD_NOT_FIRE: bulkban inside try-catch AND result.failedUsers inspected
    const result = await member.guild.members.bulkBan(userIds, { deleteMessageSeconds: 0 });
    if (result.failedUsers.length > 0) {
      console.warn(`bulkBan partial failure: ${result.failedUsers.length} users not banned`);
    }
    return result;
  } catch (err) {
    console.error('bulkBan failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. GuildBanManager.create() — guild.bans.create() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-guildbanmanager-create-no-try-catch
export async function createBanNoCatch(member: GuildMember2, userId: string) {
  // SHOULD_FIRE: discord-guildbanmanager-create-no-try-catch — throws 50013 hierarchy.
  await member.guild.bans.create(userId, { reason: 'spam' });
}

// @expect-clean
export async function createBanWithCatch(member: GuildMember2, userId: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    await member.guild.bans.create(userId, { reason: 'spam' });
  } catch (err: any) {
    if (err?.code === 50013) {
      console.warn('Cannot ban user above bot role hierarchy');
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. EntitlementManager.consume() — Discord monetization — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-entitlementmanager-consume-no-try-catch
export async function consumeEntitlementNoCatch(client: Client<true>, entitlementId: string) {
  // SHOULD_FIRE: discord-entitlementmanager-consume-no-try-catch — payment risk.
  await client.application.entitlements.consume(entitlementId);
}

// @expect-clean
export async function consumeEntitlementWithCatch(client: Client<true>, entitlementId: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch with idempotency handling
    await client.application.entitlements.consume(entitlementId);
  } catch (err: any) {
    if (err?.code === 10067) {
      // Already consumed — treat as success
      return;
    }
    // Surface to dead-letter queue for reconciliation
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. AutocompleteInteraction.respond() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-autocompleteinteraction-respond-no-try-catch
export async function respondAutocompleteNoCatch(interaction: AutocompleteInteraction) {
  // SHOULD_FIRE: respond() throws 10062 if 3s deadline missed.
  const choices = [
    { name: 'Option 1', value: 'opt1' },
    { name: 'Option 2', value: 'opt2' },
  ];
  await interaction.respond(choices);
}

// @expect-clean
export async function respondAutocompleteWithCatch(interaction: AutocompleteInteraction) {
  const choices = [
    { name: 'Option 1', value: 'opt1' },
    { name: 'Option 2', value: 'opt2' },
  ].slice(0, 25);
  try {
    // SHOULD_NOT_FIRE: inside try-catch with slice limit
    if (interaction.responded) return;
    await interaction.respond(choices);
  } catch (err) {
    // 10062 is unrecoverable — log and move on
    console.error('Autocomplete respond failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. ModalSubmitInteraction.reply() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: discord-modalsubmitinteraction-reply-no-try-catch
export async function replyModalNoCatch(interaction: ModalSubmitInteraction) {
  // SHOULD_FIRE: reply() throws 10062 / 40060 on modal handlers.
  await interaction.reply({ content: 'Submission received', ephemeral: true } as any);
}

// @expect-clean
export async function replyModalWithCatch(interaction: ModalSubmitInteraction) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    await interaction.reply({ content: 'Submission received', ephemeral: true } as any);
  } catch (err: any) {
    if (err?.code === 40060) {
      // Already acknowledged — use editReply instead
      await interaction.editReply({ content: 'Submission received' });
      return;
    }
    throw err;
  }
}
