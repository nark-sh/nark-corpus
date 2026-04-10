/**
 * discord.js Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "discord.js"):
 *   - message.delete()  postcondition: discord-message-delete-no-try-catch
 *   - message.reply()   postcondition: discord-message-reply-no-try-catch
 *
 * Detection path: Message type_name → InstanceTracker tracks instance →
 *   ThrowingFunctionDetector fires delete()/reply() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { Message } from 'discord.js';

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
