/**
 * OpenAI Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling for OpenAI.
 * Should NOT trigger any violations.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy',
});

/**
 * Proper error handling for chat completion
 */
async function createChatCompletionWithProperErrorHandling() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello\!' }],
      max_tokens: 100,
    });
    return completion;
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      console.error('Invalid API key');
      throw new Error('OpenAI authentication failed');
    } else if (error instanceof OpenAI.RateLimitError) {
      console.error('Rate limit exceeded, implementing backoff');
      throw error;
    } else if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', error.status);
      throw error;
    }
    throw error;
  }
}

/**
 * Proper error handling for embeddings
 */
async function createEmbeddingWithProperErrorHandling(text: string) {
  try {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return embedding;
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      console.error('Auth error');
    } else if (error instanceof OpenAI.RateLimitError) {
      console.error('Rate limit');
    } else if (error instanceof OpenAI.BadRequestError) {
      console.error('Invalid request - check input length');
    }
    throw error;
  }
}

/**
 * Proper error handling for audio transcription
 */
async function createTranscriptionWithProperErrorHandling(audioFile: File) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
    });
    return transcription;
  } catch (error) {
    if (error instanceof OpenAI.BadRequestError) {
      console.error('Invalid audio file - check format and size');
    } else if (error instanceof OpenAI.RateLimitError) {
      console.error('Rate limit exceeded');
    }
    throw error;
  }
}

/**
 * Proper error handling for image generation
 */
async function generateImageWithProperErrorHandling(prompt: string) {
  try {
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
    return image;
  } catch (error) {
    if (error instanceof OpenAI.BadRequestError) {
      console.error('Content policy violation or invalid prompt');
      throw new Error('Invalid image prompt');
    } else if (error instanceof OpenAI.RateLimitError) {
      console.error('Image generation rate limit (IPM)');
    } else if (error instanceof OpenAI.AuthenticationError) {
      console.error('Auth error');
    }
    throw error;
  }
}

/**
 * Proper error handling with timeout
 */
async function createCompletionWithTimeout() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Explain quantum computing' }],
    }, {
      timeout: 30000, // 30 second timeout
    });
    return completion;
  } catch (error) {
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      console.error('Request timed out');
    } else if (error instanceof OpenAI.APIError) {
      console.error('API error:', error.message);
    }
    throw error;
  }
}

/**
 * Proper error handling for streaming
 */
async function createStreamingCompletionWithProperErrorHandling() {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true,
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('Streaming error:', error.message);
    }
    throw error;
  }
}
