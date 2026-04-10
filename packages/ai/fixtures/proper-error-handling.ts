import { generateText, streamText, generateObject, streamObject, embed, embedMany, tool } from 'ai';
import { z } from 'zod';

/**
 * Example 1: generateText - Proper Error Handling for Rate Limit
 * Contract: api-error-rate-limit
 * Handles: API rate limit errors with retry logic
 */
async function generateTextWithRateLimit() {
  try {
    const result = await generateText({
      model: {} as any,
      prompt: 'Tell me a story',
      maxRetries: 3, // Built-in retry support
    });
    return result.text;
  } catch (error) {
    console.error('Generation failed after retries:', error);
    throw error;
  }
}

/**
 * Example 2: generateText - Proper Error Handling for Auth
 * Contract: api-error-auth
 * Handles: Authentication errors
 */
async function generateTextWithAuthHandling() {
  try {
    const result = await generateText({
      model: {} as any,
      prompt: 'Hello',
    });
    return result.text;
  } catch (error: any) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('Authentication failed. Check API key.');
      // Do NOT retry auth errors
      throw new Error('Invalid API credentials');
    }
    throw error;
  }
}

/**
 * Example 3: streamText - Proper Error Handling with onError
 * Contract: stream-error-no-handler
 * Handles: Stream errors with onError callback
 */
async function streamTextWithErrorHandler() {
  const result = streamText({
    model: {} as any,
    prompt: 'Tell me a story',
    onError: (error) => {
      // Required: Handle stream errors
      console.error('Stream error occurred:', error);
      return 'An error occurred during generation. Please try again.';
    },
  });

  return result;
}

/**
 * Example 4: generateObject - Proper Schema Validation Handling
 * Contract: schema-validation-error
 * Handles: Schema validation errors
 */
async function generateObjectWithValidation() {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  try {
    const result = await generateObject({
      model: {} as any,
      schema,
      prompt: 'Generate a person',
    });
    return result.object;
  } catch (error: any) {
    if (error.name === 'ZodError' || error.message?.includes('schema')) {
      console.error('Schema validation failed:', error);
      // Handle by returning default or retrying with different prompt
      return { name: 'Unknown', age: 0 };
    }
    throw error;
  }
}

/**
 * Example 5: streamObject - Proper Stream Error Handling
 * Contract: stream-error-no-handler
 * Handles: Stream errors during object generation
 */
async function streamObjectWithErrorHandler() {
  const schema = z.object({
    steps: z.array(z.string()),
  });

  const result = streamObject({
    model: {} as any,
    schema,
    prompt: 'Generate steps',
    onError: (error) => {
      console.error('Object stream error:', error);
      return 'Failed to generate structured data';
    },
  });

  return result;
}

/**
 * Example 6: embed - Proper Network Error Handling
 * Contract: api-error-network
 * Handles: Network failures during embedding
 */
async function embedWithNetworkHandling() {
  try {
    const result = await embed({
      model: {} as any,
      value: 'Hello world',
    });
    return result.embedding;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Network error:', error);
      // Implement retry or fallback
      throw new Error('Network unavailable');
    }
    throw error;
  }
}

/**
 * Example 7: embedMany - Proper Batch Error Handling
 * Contract: batch-size-exceeded, partial-batch-failure
 * Handles: Batch processing errors
 */
async function embedManyWithBatchHandling() {
  const texts = ['text1', 'text2', 'text3'];

  try {
    const result = await embedMany({
      model: {} as any,
      values: texts,
    });
    return result.embeddings;
  } catch (error: any) {
    if (error.message?.includes('batch size')) {
      console.error('Batch too large, splitting...');
      // Split into smaller batches
      const half = Math.ceil(texts.length / 2);
      const batch1 = await embedManyWithBatchHandling();
      const batch2 = await embedManyWithBatchHandling();
      return [...batch1, ...batch2];
    }
    throw error;
  }
}

/**
 * Example 8: tool - Proper Tool Execution Error Handling
 * Contract: tool-execution-error
 * Handles: Tool execution failures
 */
async function toolWithErrorHandling() {
  const weatherTool = tool({
    description: 'Get weather',
    parameters: z.object({
      location: z.string(),
    }),
    execute: async ({ location }) => {
      try {
        // Simulated API call
        return { temp: 72, location };
      } catch (error) {
        console.error('Tool execution failed:', error);
        throw error;
      }
    },
  });

  // When calling with generateText
  try {
    const result = await generateText({
      model: {} as any,
      prompt: 'What is the weather?',
      tools: { weather: weatherTool },
    });
    return result;
  } catch (error) {
    console.error('Generation with tools failed:', error);
    throw error;
  }
}

export {
  generateTextWithRateLimit,
  generateTextWithAuthHandling,
  streamTextWithErrorHandler,
  generateObjectWithValidation,
  streamObjectWithErrorHandler,
  embedWithNetworkHandling,
  embedManyWithBatchHandling,
  toolWithErrorHandling,
};
