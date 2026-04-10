/**
 * Instance Usage Fixtures for discord.js
 *
 * Tests analyzer's ability to detect violations when using instances.
 * Should trigger violations where try-catch is missing.
 */

import { Client, GatewayIntentBits, Message, TextChannel, CommandInteraction } from 'discord.js';

// ============================================================================
// INSTANCE-BASED MESSAGE OPERATIONS
// ============================================================================

/**
 * ❌ VIOLATION: Using message instance without error handling
 */
class MessageHandler {
  async deleteMessage(msg: Message) {
    // ❌ Should trigger violation - no try-catch
    await msg.delete();
  }

  async editMessage(msg: Message, content: string) {
    // ❌ Should trigger violation
    await msg.edit(content);
  }

  async replyToMessage(msg: Message, reply: string) {
    // ❌ Should trigger violation
    await msg.reply(reply);
  }

  async addReaction(msg: Message, emoji: string) {
    // ❌ Should trigger violation
    await msg.react(emoji);
  }

  async pinMessage(msg: Message) {
    // ❌ Should trigger violation
    await msg.pin();
  }
}

// ============================================================================
// INSTANCE-BASED CHANNEL OPERATIONS
// ============================================================================

/**
 * ❌ VIOLATION: Using channel instance without error handling
 */
class ChannelHandler {
  private channel: TextChannel;

  constructor(channel: TextChannel) {
    this.channel = channel;
  }

  async sendMessage(content: string) {
    // ❌ Should trigger violation - no try-catch
    await this.channel.send(content);
  }

  async bulkDelete(count: number) {
    // ❌ Should trigger violation
    await this.channel.bulkDelete(count);
  }

  async createInvite() {
    // ❌ Should trigger violation
    return await this.channel.createInvite();
  }

  async sendMultiple(messages: string[]) {
    for (const msg of messages) {
      // ❌ Should trigger violation for each send
      await this.channel.send(msg);
    }
  }
}

// ============================================================================
// INSTANCE-BASED CLIENT OPERATIONS
// ============================================================================

/**
 * ❌ VIOLATION: Using client instance without error handling
 */
class BotClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
  }

  async connect(token: string) {
    // ❌ Should trigger violation - no try-catch
    await this.client.login(token);
  }

  async disconnect() {
    // ❌ Should trigger violation
    await this.client.destroy();
  }

  async fetchWebhook(id: string) {
    // ❌ Should trigger violation
    return await this.client.fetchWebhook(id);
  }

  async deleteWebhook(id: string, token: string) {
    // ❌ Should trigger violation
    await this.client.deleteWebhook(id, token);
  }

  getClient() {
    return this.client;
  }
}

// ============================================================================
// INSTANCE-BASED INTERACTION OPERATIONS
// ============================================================================

/**
 * ❌ VIOLATION: Using interaction instance without error handling
 */
class InteractionHandler {
  async replyToInteraction(interaction: CommandInteraction, content: string) {
    // ❌ Should trigger violation - no try-catch
    await interaction.reply(content);
  }

  async deferInteraction(interaction: CommandInteraction) {
    // ❌ Should trigger violation
    await interaction.deferReply();
  }

  async editInteractionReply(interaction: CommandInteraction, content: string) {
    // ❌ Should trigger violation
    await interaction.editReply(content);
  }

  async sendFollowUp(interaction: CommandInteraction, content: string) {
    // ❌ Should trigger violation
    await interaction.followUp(content);
  }

  async handleCommand(interaction: CommandInteraction) {
    // ❌ Multiple violations
    await interaction.deferReply();
    await interaction.editReply('Processing...');
    await interaction.followUp('Done!');
  }
}

// ============================================================================
// COMPLEX INSTANCE SCENARIOS
// ============================================================================

/**
 * ❌ MULTIPLE VIOLATIONS: Discord bot class with multiple operations
 */
class DiscordBot {
  private client: Client;
  private messageHandler: MessageHandler;
  private channelHandler: ChannelHandler | null = null;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    this.messageHandler = new MessageHandler();
  }

  async start(token: string) {
    // ❌ Should trigger violation
    await this.client.login(token);
    console.log('Bot is online');
  }

  async handleMessage(message: Message) {
    if (message.content.startsWith('!ping')) {
      // ❌ Should trigger violation
      await message.reply('Pong!');
    } else if (message.content.startsWith('!delete')) {
      // ❌ Should trigger violation through instance
      await this.messageHandler.deleteMessage(message);
    } else if (message.content.startsWith('!echo')) {
      const content = message.content.slice(6);
      const channel = message.channel as TextChannel;

      // ❌ Should trigger violation
      await channel.send(content);
    }
  }

  async handleInteraction(interaction: CommandInteraction) {
    if (interaction.commandName === 'ping') {
      // ❌ Should trigger violation
      await interaction.reply('Pong!');
    } else if (interaction.commandName === 'info') {
      // ❌ Multiple violations
      await interaction.deferReply();
      await interaction.editReply('Server info...');
    }
  }

  async shutdown() {
    // ❌ Should trigger violation
    await this.client.destroy();
  }
}

// ============================================================================
// STORED INSTANCES
// ============================================================================

/**
 * ❌ VIOLATION: Operations on stored message instance
 */
class MessageCache {
  private cachedMessage: Message | null = null;

  cacheMessage(message: Message) {
    this.cachedMessage = message;
  }

  async editCachedMessage(newContent: string) {
    if (this.cachedMessage) {
      // ❌ Should trigger violation - using stored instance
      await this.cachedMessage.edit(newContent);
    }
  }

  async deleteCachedMessage() {
    if (this.cachedMessage) {
      // ❌ Should trigger violation
      await this.cachedMessage.delete();
    }
  }

  async reactToCachedMessage(emoji: string) {
    if (this.cachedMessage) {
      // ❌ Should trigger violation
      await this.cachedMessage.react(emoji);
    }
  }
}

// ============================================================================
// CHAINED INSTANCE OPERATIONS
// ============================================================================

/**
 * ❌ VIOLATION: Chained operations through instances
 */
async function chainedInstanceOperations(message: Message) {
  // ❌ Multiple violations through chained instance methods
  await message.react('👍');
  await message.pin();
  await message.reply('Message processed');

  const channel = message.channel as TextChannel;
  await channel.send('Operation complete');

  const guild = message.guild;
  if (guild) {
    await guild.fetchAuditLogs();
  }
}

/**
 * ❌ VIOLATION: Operations passed through function parameters
 */
async function performOperations(msg: Message, chan: TextChannel, interaction: CommandInteraction) {
  // ❌ Each should trigger violation
  await msg.delete();
  await chan.send('Test');
  await interaction.reply('Test');
}

/**
 * ❌ VIOLATION: Instance retrieved from array/collection
 */
async function operateOnMultipleMessages(messages: Message[]) {
  for (const msg of messages) {
    // ❌ Should trigger violation for each message
    await msg.delete();
  }
}

/**
 * ❌ VIOLATION: Instance from method return value
 */
async function operateOnFetchedMessage(channel: TextChannel, messageId: string) {
  // ❌ First violation for fetch
  const message = await channel.messages.fetch(messageId);

  // ❌ Second violation for delete
  await message.delete();

  // ❌ Third violation for send
  await channel.send('Message deleted');
}

export {
  MessageHandler,
  ChannelHandler,
  BotClient,
  InteractionHandler,
  DiscordBot,
  MessageCache,
  chainedInstanceOperations
};
