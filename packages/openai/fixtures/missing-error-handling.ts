/**
 * OpenAI Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy',
});

/**
 * ❌ Missing try-catch for chat completion
 * Should trigger ERROR violation
 */
async function createChatCompletionWithoutErrorHandling() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello\!' }],
  });
  return completion;
}

/**
 * ❌ Missing try-catch for embeddings
 * Should trigger ERROR violation
 */
async function createEmbeddingWithoutErrorHandling(text: string) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return embedding;
}

/**
 * ❌ Missing try-catch for audio transcription
 * Should trigger ERROR violation
 */
async function createTranscriptionWithoutErrorHandling(audioFile: File) {
  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audioFile,
  });
  return transcription;
}

/**
 * ❌ Missing try-catch for audio translation
 * Should trigger ERROR violation
 */
async function createTranslationWithoutErrorHandling(audioFile: File) {
  const translation = await openai.audio.translations.create({
    model: 'whisper-1',
    file: audioFile,
  });
  return translation;
}

/**
 * ❌ Missing try-catch for image generation
 * Should trigger ERROR violation
 */
async function generateImageWithoutErrorHandling(prompt: string) {
  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
  });
  return image;
}

/**
 * ❌ Missing try-catch with streaming
 * Should trigger ERROR violation
 */
async function createStreamingWithoutErrorHandling() {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello' }],
    stream: true,
  });

  for await (const chunk of stream) {
    console.log(chunk.choices[0]?.delta?.content);
  }
}

/**
 * ❌ Missing try-catch for fine-tuning job creation
 * Should trigger ERROR violation
 */
async function createFineTuneWithoutErrorHandling(trainingFileId: string) {
  const fineTune = await openai.fineTuning.jobs.create({
    training_file: trainingFileId,
    model: 'gpt-3.5-turbo',
  });
  return fineTune;
}

/**
 * ❌ Missing try-catch for moderation
 * Should trigger ERROR violation
 */
async function createModerationWithoutErrorHandling(text: string) {
  const moderation = await openai.moderations.create({
    input: text,
  });
  return moderation;
}
