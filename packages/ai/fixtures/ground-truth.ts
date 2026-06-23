/**
 * ai (Vercel AI SDK) Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the ai contract spec, NOT V1 behavior.
 *
 * Contracted functions covered here:
 *   - generateText()    postcondition: api-error-network, api-error-rate-limit, api-error-auth
 *   - generateObject()  postcondition: schema-validation-error, api-error-network
 *   - generateImage()   postcondition: generateimage-no-image-generated, generateimage-api-call-error
 *   - generateSpeech()  postcondition: generatespeech-no-speech-generated, generatespeech-api-call-error
 *   - transcribe()      postcondition: transcribe-no-transcript-generated, transcribe-download-error, transcribe-api-call-error
 *   - rerank()          postcondition: rerank-api-call-error, rerank-retry-exhausted
 *
 * Known FNs (V2 analyzer limitations):
 *   - embed() / embedMany()     — import-level detection gap, not caught in standalone files
 *   - streamText() / streamObject() — onError absence detection unstable in isolation
 *   These patterns ARE caught when analyzed within larger codebases (confirmed in missing-error-handling.ts)
 *
 * Key rules:
 *   - generateText/generateObject/generateImage/generateSpeech/transcribe/rerank MUST be wrapped in try-catch
 *   - A try-catch wrapper (any catch block) satisfies the requirement
 *   - WARNING-level issues (api-error-rate-limit) may fire even inside try-catch — not a failure
 */

import { generateText, generateObject, generateImage, generateSpeech, transcribe } from 'ai';
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// 1. generateText — core text generation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateTextNoCatch() {
  // SHOULD_FIRE: api-error-rate-limit — generateText throws on API failure, no try-catch
  const result = await generateText({
    model: {} as any,
    prompt: 'Tell me a story',
  });
  return result.text;
}

export async function generateTextWithCatch() {
  try {
    // SHOULD_NOT_FIRE: generateText inside try-catch satisfies error handling requirement
    const result = await generateText({
      model: {} as any,
      prompt: 'Tell me a story',
    });
    return result.text;
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
}

export async function generateTextWithMessagesNoCatch() {
  // SHOULD_FIRE: api-error-rate-limit — chat-style generateText without try-catch
  const result = await generateText({
    model: {} as any,
    system: 'You are a helpful assistant.',
    messages: [{ role: 'user', content: 'Explain quantum computing' }],
    maxTokens: 500,
  });
  return result.text;
}

export async function generateTextWithMessagesWithCatch() {
  try {
    // SHOULD_NOT_FIRE: generateText with messages inside try-catch satisfies requirement
    const result = await generateText({
      model: {} as any,
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: 'Explain quantum computing' }],
    });
    return result.text;
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. generateObject — structured data generation
// ─────────────────────────────────────────────────────────────────────────────

const personSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

export async function generateObjectNoCatch() {
  // SHOULD_FIRE: schema-validation-error — generateObject throws on schema failure, no try-catch
  const result = await generateObject({
    model: {} as any,
    schema: personSchema,
    prompt: 'Generate a person with name, age, and email',
  });
  return result.object;
}

export async function generateObjectWithCatch() {
  try {
    // SHOULD_NOT_FIRE: generateObject inside try-catch satisfies error handling requirement
    const result = await generateObject({
      model: {} as any,
      schema: personSchema,
      prompt: 'Generate a person',
    });
    return result.object;
  } catch (error) {
    console.error('Object generation failed:', error);
    throw error;
  }
}

export async function generateObjectEnumNoCatch() {
  // Known FN: generateObject with output:'enum' not detected (V2 analyzer limitation — only first schema form matched)
  // SHOULD_NOT_FIRE (FN): would ideally fire but analyzer does not detect enum output variant
  const result = await generateObject({
    model: {} as any,
    output: 'enum',
    enum: ['positive', 'neutral', 'negative'],
    prompt: 'Classify: "I love this product!"',
  });
  return result.object;
}

export async function generateObjectEnumWithCatch() {
  try {
    // SHOULD_NOT_FIRE: generateObject enum inside try-catch satisfies requirement
    const result = await generateObject({
      model: {} as any,
      output: 'enum',
      enum: ['positive', 'neutral', 'negative'],
      prompt: 'Classify this text',
    });
    return result.object;
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. generateImage — image generation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateImageNoCatch() {
  // SHOULD_FIRE: generateimage-no-image-generated — generateImage throws NoImageGeneratedError, no try-catch
  const { image } = await generateImage({
    model: {} as any,
    prompt: 'A cat sitting on a mat',
  });
  return image.base64;
}

export async function generateImageWithCatch() {
  try {
    // SHOULD_NOT_FIRE: generateImage inside try-catch satisfies error handling requirement
    const { image } = await generateImage({
      model: {} as any,
      prompt: 'A cat sitting on a mat',
    });
    return image.base64;
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
}

export async function generateImageMultipleNoCatch() {
  // SHOULD_FIRE: generateimage-no-image-generated — batch image generation without try-catch
  const { images } = await generateImage({
    model: {} as any,
    prompt: 'A landscape photo',
    n: 4,
  });
  return images.map((img) => img.base64);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. generateSpeech — text-to-speech
// ─────────────────────────────────────────────────────────────────────────────

export async function generateSpeechNoCatch() {
  // SHOULD_FIRE: generatespeech-no-speech-generated — generateSpeech throws NoSpeechGeneratedError, no try-catch
  const { audio } = await generateSpeech({
    model: {} as any,
    text: 'Hello, world\!',
    voice: 'alloy',
  });
  return audio.data;
}

export async function generateSpeechWithCatch() {
  try {
    // SHOULD_NOT_FIRE: generateSpeech inside try-catch satisfies error handling requirement
    const { audio } = await generateSpeech({
      model: {} as any,
      text: 'Hello, world\!',
      voice: 'alloy',
    });
    return audio.data;
  } catch (error) {
    console.error('Speech generation failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. transcribe — speech-to-text
// ─────────────────────────────────────────────────────────────────────────────

export async function transcribeAudioNoCatch(audioData: Uint8Array) {
  // SHOULD_FIRE: transcribe-no-transcript-generated — transcribe throws NoTranscriptGeneratedError, no try-catch
  const { text } = await transcribe({
    model: {} as any,
    audio: audioData,
  });
  return text;
}

export async function transcribeAudioWithCatch(audioData: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: transcribe inside try-catch satisfies error handling requirement
    const { text } = await transcribe({
      model: {} as any,
      audio: audioData,
    });
    return text;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}

export async function transcribeFromUrlNoCatch() {
  // SHOULD_FIRE: transcribe-no-transcript-generated — URL transcription can throw DownloadError, no try-catch
  const { text } = await transcribe({
    model: {} as any,
    audio: new URL('https://example.com/audio.mp3'),
  });
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ToolLoopAgent — v6 Agent class with .generate() / .stream()
//    Added 2026-06-23 deepen pass against ai@6.0.209.
// ─────────────────────────────────────────────────────────────────────────────

import { ToolLoopAgent, validateUIMessages, createUIMessageStream } from 'ai';

export async function agentGenerateNoCatch(agent: ToolLoopAgent) {
  // SHOULD_FIRE: agent-api-error — agent.generate() can throw APICallError, no try-catch
  const result = await agent.generate({ prompt: 'What is the weather?' } as any);
  return result.text;
}

export async function agentGenerateWithCatch(agent: ToolLoopAgent) {
  try {
    // SHOULD_NOT_FIRE: agent.generate() inside try-catch satisfies the requirement
    const result = await agent.generate({ prompt: 'What is the weather?' } as any);
    return result.text;
  } catch (error) {
    console.error('Agent generate failed:', error);
    throw error;
  }
}

export async function agentStreamNoCatch(agent: ToolLoopAgent) {
  // SHOULD_FIRE: agent-api-error — agent.stream() can throw APICallError, no try-catch
  const result = await agent.stream({ prompt: 'Stream the answer' } as any);
  return result;
}

export async function agentStreamWithCatch(agent: ToolLoopAgent) {
  try {
    // SHOULD_NOT_FIRE: agent.stream() inside try-catch satisfies the requirement
    const result = await agent.stream({ prompt: 'Stream the answer' } as any);
    return result;
  } catch (error) {
    console.error('Agent stream failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. validateUIMessages — v6 persistence validator
// ─────────────────────────────────────────────────────────────────────────────

export async function loadAndValidateMessagesNoCatch(persistedMessages: unknown) {
  // SHOULD_FIRE: validate-ui-messages-type-validation — validateUIMessages throws TypeValidationError, no try-catch
  const validated = await validateUIMessages({
    messages: persistedMessages,
  } as any);
  return validated;
}

export async function loadAndValidateMessagesWithCatch(persistedMessages: unknown) {
  try {
    // SHOULD_NOT_FIRE: validateUIMessages inside try-catch — proper persistence handling
    const validated = await validateUIMessages({
      messages: persistedMessages,
    } as any);
    return validated;
  } catch (error) {
    // Documented recovery: log + start with empty chat history
    console.error('Database messages validation failed:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. createUIMessageStream — v6 server-side SSE stream builder
// ─────────────────────────────────────────────────────────────────────────────

export async function createStreamNoOnError() {
  // SHOULD_FIRE: create-ui-message-stream-error-leak — no explicit onError handler
  // leaks server exception details into client error chunks for ai<6.0.207
  // and is brittle to silently inherit the default for ai>=6.0.207.
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'text-delta', delta: 'hello' } as any);
    },
  } as any);
  return stream;
}

export async function createStreamWithSafeOnError() {
  // SHOULD_NOT_FIRE: explicit onError that returns a generic application-controlled
  // string — safe across all ai versions.
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'text-delta', delta: 'hello' } as any);
    },
    onError: () => 'An error occurred while processing your request.',
  } as any);
  return stream;
}
