/**
 * Proper Error Handling Fixtures for discord.js
 *
 * This file demonstrates CORRECT error handling patterns.
 * Should NOT trigger any violations.
 */

import { Client, GatewayIntentBits, Message, TextChannel, CommandInteraction, Guild, GuildMember } from 'discord.js';

// ============================================================================
// CLIENT OPERATIONS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: Client.login() wrapped in try-catch
 */
async function loginWithErrorHandling() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  try {
    await client.login('YOUR_TOKEN_HERE');
    console.log('Bot logged in successfully');
  } catch (error) {
    console.error('Failed to login:', error);
    throw error;
  }
}

/**
 * ✅ PROPER: Client.destroy() wrapped in try-catch
 */
async function destroyClientWithErrorHandling(client: Client) {
  try {
    await client.destroy();
    console.log('Client destroyed successfully');
  } catch (error) {
    console.error('Failed to destroy client:', error);
  }
}

// ============================================================================
// MESSAGE OPERATIONS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: Message.delete() with error handling
 */
async function deleteMessageSafely(message: Message) {
  try {
    await message.delete();
    console.log('Message deleted successfully');
  } catch (error: any) {
    if (error.code === 10008) { // Unknown Message
      console.log('Message already deleted');
    } else {
      console.error('Failed to delete message:', error);
    }
  }
}

/**
 * ✅ PROPER: Message.edit() with error handling
 */
async function editMessageSafely(message: Message, newContent: string) {
  try {
    await message.edit(newContent);
    console.log('Message edited successfully');
  } catch (error) {
    console.error('Failed to edit message:', error);
    throw error;
  }
}

/**
 * ✅ PROPER: Message.reply() with error handling
 */
async function replyToMessageSafely(message: Message) {
  try {
    await message.reply('This is a safe reply!');
  } catch (error: any) {
    if (error.code === 50013) { // Missing Permissions
      console.log('Bot lacks permission to reply');
    } else {
      console.error('Failed to reply:', error);
    }
  }
}

/**
 * ✅ PROPER: Message.react() with error handling
 */
async function addReactionSafely(message: Message, emoji: string) {
  try {
    await message.react(emoji);
  } catch (error: any) {
    if (error.code === 50013) {
      console.log('Bot lacks permission to react');
    } else {
      console.error('Failed to add reaction:', error);
    }
  }
}

/**
 * ✅ PROPER: Multiple message operations with error handling
 */
async function processMessageSafely(message: Message) {
  try {
    await message.react('✅');
    await message.pin();
    await message.reply('Processed!');
  } catch (error) {
    console.error('Failed to process message:', error);
    // Graceful degradation
    try {
      await message.reply('Processing failed, but I can still reply!');
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError);
    }
  }
}

// ============================================================================
// CHANNEL OPERATIONS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: TextChannel.send() with error handling
 */
async function sendMessageSafely(channel: TextChannel, content: string) {
  try {
    await channel.send(content);
    console.log('Message sent successfully');
  } catch (error: any) {
    if (error.code === 50013) {
      console.log('Missing permission to send messages');
    } else if (error.code === 50035) {
      console.log('Invalid message content');
    } else {
      console.error('Failed to send message:', error);
    }
  }
}

/**
 * ✅ PROPER: TextChannel.bulkDelete() with error handling
 */
async function bulkDeleteSafely(channel: TextChannel, count: number) {
  try {
    await channel.bulkDelete(count);
    console.log(`Deleted ${count} messages`);
  } catch (error: any) {
    if (error.code === 50034) {
      console.log('Cannot delete messages older than 14 days');
    } else {
      console.error('Bulk delete failed:', error);
    }
  }
}

// ============================================================================
// INTERACTION OPERATIONS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: CommandInteraction.reply() with error handling
 */
async function replyToInteractionSafely(interaction: CommandInteraction) {
  try {
    await interaction.reply('Pong!');
  } catch (error: any) {
    if (error.code === 10062) {
      console.log('Interaction token expired');
    } else {
      console.error('Failed to reply to interaction:', error);
    }
  }
}

/**
 * ✅ PROPER: Long-running command with deferReply
 */
async function longRunningCommandSafely(interaction: CommandInteraction) {
  try {
    // Defer reply to extend token validity
    await interaction.deferReply();

    // Simulate long operation
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Edit the deferred reply
    await interaction.editReply('Operation completed!');
  } catch (error) {
    console.error('Command failed:', error);

    // Try to inform user of failure
    try {
      if (interaction.deferred) {
        await interaction.editReply('Command failed!');
      } else {
        await interaction.reply('Command failed!');
      }
    } catch (fallbackError) {
      console.error('Could not inform user:', fallbackError);
    }
  }
}

/**
 * ✅ PROPER: CommandInteraction.followUp() with error handling
 */
async function sendFollowUpSafely(interaction: CommandInteraction) {
  try {
    // Initial reply
    await interaction.reply('Processing...');

    // Follow-up message
    await interaction.followUp('Done!');
  } catch (error) {
    console.error('Follow-up failed:', error);
  }
}

// ============================================================================
// GUILD OPERATIONS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: Guild.fetch() with error handling
 */
async function fetchGuildSafely(guild: Guild) {
  try {
    const freshGuild = await guild.fetch();
    console.log('Guild fetched:', freshGuild.name);
  } catch (error) {
    console.error('Failed to fetch guild:', error);
  }
}

/**
 * ✅ PROPER: Guild.edit() with error handling
 */
async function editGuildSafely(guild: Guild, newName: string) {
  try {
    await guild.edit({ name: newName });
    console.log('Guild renamed successfully');
  } catch (error: any) {
    if (error.code === 50013) {
      console.log('Missing MANAGE_GUILD permission');
    } else {
      console.error('Failed to edit guild:', error);
    }
  }
}

// ============================================================================
// MEMBER OPERATIONS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: GuildMember.ban() with error handling
 */
async function banMemberSafely(member: GuildMember, reason: string) {
  try {
    await member.ban({ reason });
    console.log(`Banned ${member.user.tag}`);
  } catch (error: any) {
    if (error.code === 50013) {
      console.log('Missing BAN_MEMBERS permission');
    } else if (error.code === 50013) {
      console.log('Cannot ban member with higher role');
    } else {
      console.error('Failed to ban member:', error);
    }
  }
}

/**
 * ✅ PROPER: GuildMember.kick() with error handling
 */
async function kickMemberSafely(member: GuildMember, reason: string) {
  try {
    await member.kick(reason);
    console.log(`Kicked ${member.user.tag}`);
  } catch (error) {
    console.error('Failed to kick member:', error);
  }
}

/**
 * ✅ PROPER: GuildMember.timeout() with error handling
 */
async function timeoutMemberSafely(member: GuildMember, duration: number) {
  try {
    await member.timeout(duration, 'Timed out for rule violation');
    console.log(`Member timed out for ${duration}ms`);
  } catch (error: any) {
    if (error.code === 50013) {
      console.log('Missing MODERATE_MEMBERS permission');
    } else {
      console.error('Failed to timeout member:', error);
    }
  }
}

// ============================================================================
// COMPLEX SCENARIOS - PROPER ERROR HANDLING
// ============================================================================

/**
 * ✅ PROPER: Bot command handler with comprehensive error handling
 */
async function handleCommandWithProperErrorHandling(message: Message) {
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'purge') {
    try {
      const count = parseInt(args[0]);
      if (isNaN(count) || count < 1 || count > 100) {
        await message.reply('Please provide a number between 1 and 100');
        return;
      }

      const channel = message.channel as TextChannel;
      await channel.bulkDelete(count);

      const confirmation = await message.reply(`Deleted ${count} messages`);

      // Auto-delete confirmation after 5 seconds
      setTimeout(async () => {
        try {
          await confirmation.delete();
        } catch (error) {
          // Ignore if already deleted
          console.log('Confirmation message already deleted');
        }
      }, 5000);
    } catch (error: any) {
      if (error.code === 50013) {
        await message.reply('I need MANAGE_MESSAGES permission');
      } else if (error.code === 50034) {
        await message.reply('Cannot delete messages older than 14 days');
      } else {
        console.error('Purge command failed:', error);
        await message.reply('An error occurred while purging messages');
      }
    }
  }
}

/**
 * ✅ PROPER: Instance-based usage with error handling
 */
class BotWithProperErrorHandling {
  private client: Client;

  constructor() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
  }

  async start(token: string) {
    try {
      await this.client.login(token);
      console.log('Bot started successfully');
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  async sendWelcomeMessage(channel: TextChannel) {
    try {
      await channel.send('Welcome to the server!');
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  }

  async stop() {
    try {
      await this.client.destroy();
      console.log('Bot stopped successfully');
    } catch (error) {
      console.error('Failed to stop bot:', error);
    }
  }
}

export {
  loginWithErrorHandling,
  destroyClientWithErrorHandling,
  deleteMessageSafely,
  editMessageSafely,
  replyToMessageSafely,
  sendMessageSafely,
  replyToInteractionSafely,
  longRunningCommandSafely,
  banMemberSafely,
  BotWithProperErrorHandling
};
