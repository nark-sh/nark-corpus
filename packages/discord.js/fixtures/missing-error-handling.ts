/**
 * Missing Error Handling Fixtures for discord.js
 *
 * This file demonstrates INCORRECT error handling patterns.
 * Should trigger ERROR violations for each unhandled operation.
 */

import { Client, GatewayIntentBits, Message, TextChannel, CommandInteraction, Guild, GuildMember } from 'discord.js';

// ============================================================================
// CLIENT OPERATIONS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ VIOLATION: Client.login() without try-catch
 * Should trigger: "Client.login() requires error handling"
 */
async function loginWithoutErrorHandling() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  // ❌ No try-catch - will crash on invalid token
  await client.login('YOUR_TOKEN_HERE');
  console.log('Bot logged in');
}

/**
 * ❌ VIOLATION: Client.destroy() without try-catch
 */
async function destroyClientWithoutErrorHandling(client: Client) {
  // ❌ No error handling
  await client.destroy();
}

// ============================================================================
// MESSAGE OPERATIONS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ VIOLATION: Message.delete() without error handling
 * Should trigger: "Message.delete() requires error handling"
 */
async function deleteMessageUnsafely(message: Message) {
  // ❌ No try-catch - will crash if already deleted
  await message.delete();
  console.log('Message deleted');
}

/**
 * ❌ VIOLATION: Message.edit() without error handling
 */
async function editMessageUnsafely(message: Message, newContent: string) {
  // ❌ No error handling
  await message.edit(newContent);
}

/**
 * ❌ VIOLATION: Message.reply() without error handling
 */
async function replyToMessageUnsafely(message: Message) {
  // ❌ No try-catch - will crash with permission errors
  await message.reply('This reply might fail!');
}

/**
 * ❌ VIOLATION: Message.react() without error handling
 */
async function addReactionUnsafely(message: Message, emoji: string) {
  // ❌ No error handling
  await message.react(emoji);
}

/**
 * ❌ VIOLATION: Message.pin() without error handling
 */
async function pinMessageUnsafely(message: Message) {
  // ❌ No error handling
  await message.pin();
}

/**
 * ❌ VIOLATION: Message.unpin() without error handling
 */
async function unpinMessageUnsafely(message: Message) {
  // ❌ No error handling
  await message.unpin();
}

/**
 * ❌ VIOLATION: Message.crosspost() without error handling
 */
async function crosspostMessageUnsafely(message: Message) {
  // ❌ No error handling
  await message.crosspost();
}

/**
 * ❌ VIOLATION: Message.fetch() without error handling
 */
async function fetchMessageUnsafely(message: Message) {
  // ❌ No error handling
  await message.fetch();
}

/**
 * ❌ VIOLATION: Message.fetchReference() without error handling
 */
async function fetchReferenceUnsafely(message: Message) {
  // ❌ No error handling - will crash if reference is deleted
  await message.fetchReference();
}

/**
 * ❌ VIOLATION: Message.startThread() without error handling
 */
async function startThreadUnsafely(message: Message, threadName: string) {
  // ❌ No error handling
  await message.startThread({ name: threadName });
}

/**
 * ❌ MULTIPLE VIOLATIONS: Multiple operations without error handling
 */
async function processMessageUnsafely(message: Message) {
  // ❌ Multiple violations
  await message.react('✅');
  await message.pin();
  await message.reply('Processed!');
}

// ============================================================================
// CHANNEL OPERATIONS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ VIOLATION: TextChannel.send() without error handling
 * Should trigger: "TextChannel.send() requires error handling"
 */
async function sendMessageUnsafely(channel: TextChannel, content: string) {
  // ❌ No try-catch - will crash with permission errors
  await channel.send(content);
}

/**
 * ❌ VIOLATION: TextChannel.bulkDelete() without error handling
 */
async function bulkDeleteUnsafely(channel: TextChannel, count: number) {
  // ❌ No error handling - will crash if messages > 14 days old
  await channel.bulkDelete(count);
}

/**
 * ❌ VIOLATION: TextChannel.createInvite() without error handling
 */
async function createInviteUnsafely(channel: TextChannel) {
  // ❌ No error handling
  await channel.createInvite();
}

// ============================================================================
// INTERACTION OPERATIONS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ VIOLATION: CommandInteraction.reply() without error handling
 * Should trigger: "CommandInteraction.reply() requires error handling"
 */
async function replyToInteractionUnsafely(interaction: CommandInteraction) {
  // ❌ No try-catch - will crash if token expired
  await interaction.reply('Pong!');
}

/**
 * ❌ VIOLATION: CommandInteraction.deferReply() without error handling
 */
async function deferReplyUnsafely(interaction: CommandInteraction) {
  // ❌ No error handling
  await interaction.deferReply();
}

/**
 * ❌ VIOLATION: CommandInteraction.followUp() without error handling
 */
async function followUpUnsafely(interaction: CommandInteraction) {
  // ❌ Multiple violations
  await interaction.reply('Processing...');
  await interaction.followUp('Done!');
}

/**
 * ❌ VIOLATION: CommandInteraction.editReply() without error handling
 */
async function editReplyUnsafely(interaction: CommandInteraction) {
  // ❌ No error handling
  await interaction.deferReply();
  await interaction.editReply('Updated!');
}

/**
 * ❌ VIOLATION: Long-running command without proper error handling
 */
async function longRunningCommandUnsafely(interaction: CommandInteraction) {
  // ❌ No error handling
  await interaction.deferReply();

  // Simulate long operation
  await new Promise(resolve => setTimeout(resolve, 5000));

  // ❌ This could fail but no error handling
  await interaction.editReply('Operation completed!');
}

// ============================================================================
// GUILD OPERATIONS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ VIOLATION: Guild.fetch() without error handling
 */
async function fetchGuildUnsafely(guild: Guild) {
  // ❌ No error handling
  await guild.fetch();
}

/**
 * ❌ VIOLATION: Guild.edit() without error handling
 */
async function editGuildUnsafely(guild: Guild, newName: string) {
  // ❌ No error handling - will crash with permission errors
  await guild.edit({ name: newName });
}

/**
 * ❌ VIOLATION: Guild.leave() without error handling
 */
async function leaveGuildUnsafely(guild: Guild) {
  // ❌ No error handling
  await guild.leave();
}

/**
 * ❌ VIOLATION: Guild.fetchAuditLogs() without error handling
 */
async function fetchAuditLogsUnsafely(guild: Guild) {
  // ❌ No error handling
  await guild.fetchAuditLogs();
}

/**
 * ❌ VIOLATION: Guild.fetchOwner() without error handling
 */
async function fetchOwnerUnsafely(guild: Guild) {
  // ❌ No error handling
  await guild.fetchOwner();
}

/**
 * ❌ VIOLATION: Guild.fetchWebhooks() without error handling
 */
async function fetchWebhooksUnsafely(guild: Guild) {
  // ❌ No error handling
  await guild.fetchWebhooks();
}

// ============================================================================
// MEMBER OPERATIONS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ VIOLATION: GuildMember.ban() without error handling
 * Should trigger: "GuildMember.ban() requires error handling"
 */
async function banMemberUnsafely(member: GuildMember, reason: string) {
  // ❌ No try-catch - will crash with permission or hierarchy errors
  await member.ban({ reason });
}

/**
 * ❌ VIOLATION: GuildMember.kick() without error handling
 */
async function kickMemberUnsafely(member: GuildMember, reason: string) {
  // ❌ No error handling
  await member.kick(reason);
}

/**
 * ❌ VIOLATION: GuildMember.timeout() without error handling
 */
async function timeoutMemberUnsafely(member: GuildMember, duration: number) {
  // ❌ No error handling
  await member.timeout(duration, 'Rule violation');
}

/**
 * ❌ VIOLATION: GuildMember.edit() without error handling
 */
async function editMemberUnsafely(member: GuildMember, nickname: string) {
  // ❌ No error handling
  await member.edit({ nick: nickname });
}

// ============================================================================
// COMPLEX SCENARIOS - MISSING ERROR HANDLING
// ============================================================================

/**
 * ❌ MULTIPLE VIOLATIONS: Bot command handler without error handling
 */
async function handleCommandWithoutErrorHandling(message: Message) {
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'purge') {
    const count = parseInt(args[0]);

    // ❌ No validation, no error handling
    const channel = message.channel as TextChannel;
    await channel.bulkDelete(count);

    // ❌ Another violation
    await message.reply(`Deleted ${count} messages`);
  } else if (command === 'ban') {
    const member = message.mentions.members?.first();

    // ❌ No error handling
    await member?.ban({ reason: 'Banned by command' });
    await message.reply('User banned');
  }
}

/**
 * ❌ MULTIPLE VIOLATIONS: Instance-based usage without error handling
 */
class BotWithoutErrorHandling {
  private client: Client;

  constructor() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
  }

  async start(token: string) {
    // ❌ No error handling - will crash on invalid token
    await this.client.login(token);
  }

  async sendWelcomeMessage(channel: TextChannel) {
    // ❌ No error handling - will crash with permission errors
    await channel.send('Welcome to the server!');
  }

  async stop() {
    // ❌ No error handling
    await this.client.destroy();
  }

  async banUser(member: GuildMember) {
    // ❌ No error handling
    await member.ban();
  }
}

/**
 * ❌ VIOLATION: Nested operations without error handling
 */
async function nestedOperationsUnsafely(message: Message) {
  // ❌ Multiple nested violations
  await message.reply('Starting process...');

  const channel = message.channel as TextChannel;
  await channel.send('Step 1 complete');

  await message.react('✅');

  const guild = message.guild!;
  await guild.fetchAuditLogs();

  await channel.send('Process complete!');
}

/**
 * ❌ VIOLATION: Chained operations without error handling
 */
async function chainedOperationsUnsafely(interaction: CommandInteraction) {
  // ❌ Each of these needs error handling
  await interaction.deferReply();
  const response = await interaction.editReply('Processing...');
  await interaction.followUp('Additional info');
}

export {
  loginWithoutErrorHandling,
  deleteMessageUnsafely,
  sendMessageUnsafely,
  replyToInteractionUnsafely,
  banMemberUnsafely,
  BotWithoutErrorHandling,
  handleCommandWithoutErrorHandling
};
