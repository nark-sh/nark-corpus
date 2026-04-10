import { generateText, streamText, generateObject, streamObject, embed, embedMany, tool } from 'ai';
import { z } from 'zod';

/**
 * VIOLATION Example 1: generateText - Missing Error Handling
 * Contract: api-error-rate-limit, api-error-auth, api-error-network
 * Expected Violation: No try-catch for API errors
 */
async function generateTextNoErrorHandling() {
  // ❌ NO try-catch - this should be caught by the contract
  const result = await generateText({
    model: {} as any,
    prompt: 'Tell me a story',
  });
  return result.text;
}

/**
 * VIOLATION Example 2: streamText - Missing onError Handler
 * Contract: stream-error-no-handler
 * Expected Violation: No onError callback for stream errors
 */
async function streamTextNoErrorHandler() {
  // ❌ NO onError callback - stream errors will crash the app
  const result = streamText({
    model: {} as any,
    prompt: 'Tell me a story',
  });

  return result;
}

/**
 * VIOLATION Example 3: generateObject - Missing Schema Validation Handling
 * Contract: schema-validation-error, json-parsing-error
 * Expected Violation: No try-catch for schema/parsing errors
 */
async function generateObjectNoValidation() {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  // ❌ NO try-catch - schema validation errors will crash
  const result = await generateObject({
    model: {} as any,
    schema,
    prompt: 'Generate a person',
  });

  return result.object;
}

/**
 * VIOLATION Example 4: streamObject - Missing Stream Error Handler
 * Contract: stream-error-no-handler, stream-schema-validation-error
 * Expected Violation: No onError for stream errors
 */
async function streamObjectNoErrorHandler() {
  const schema = z.object({
    steps: z.array(z.string()),
  });

  // ❌ NO onError callback
  const result = streamObject({
    model: {} as any,
    schema,
    prompt: 'Generate steps',
  });

  return result;
}

/**
 * VIOLATION Example 5: embed - Missing Network Error Handling
 * Contract: api-error-network, api-error-rate-limit
 * Expected Violation: No error handling for network/API errors
 */
async function embedNoErrorHandling() {
  // ❌ NO try-catch for network errors
  const result = await embed({
    model: {} as any,
    value: 'Hello world',
  });

  return result.embedding;
}

/**
 * VIOLATION Example 6: embedMany - Missing Batch Error Handling
 * Contract: batch-size-exceeded, partial-batch-failure, api-error-rate-limit
 * Expected Violation: No handling for batch errors
 */
async function embedManyNoErrorHandling() {
  const texts = Array(1000).fill('text'); // Likely to exceed batch size

  // ❌ NO try-catch for batch errors
  const result = await embedMany({
    model: {} as any,
    values: texts,
  });

  return result.embeddings;
}

/**
 * VIOLATION Example 7: generateText with Invalid Request
 * Contract: api-error-invalid-request
 * Expected Violation: No validation before calling API
 */
async function generateTextInvalidRequest() {
  // ❌ NO try-catch, no parameter validation
  const result = await generateText({
    model: {} as any,
    prompt: '', // Empty prompt may cause validation error
  });

  return result.text;
}

/**
 * VIOLATION Example 8: generateText with Content Filter
 * Contract: model-error-content-filter
 * Expected Violation: No handling for content filtering
 */
async function generateTextContentFilter() {
  // ❌ NO try-catch for content filter errors
  const result = await generateText({
    model: {} as any,
    prompt: 'Generate harmful content', // May trigger filter
  });

  return result.text;
}

/**
 * VIOLATION Example 9: tool - Missing Tool Execution Error Handling
 * Contract: tool-execution-error, tool-schema-validation-error
 * Expected Violation: No error handling in tool execute
 */
async function toolNoErrorHandling() {
  const weatherTool = tool({
    description: 'Get weather',
    parameters: z.object({
      location: z.string(),
    }),
    execute: async ({ location }) => {
      // ❌ NO try-catch in tool execution
      const response = await fetch(`https://api.weather.com/${location}`);
      const data = await response.json();
      return data;
    },
  });

  // ❌ Also no try-catch when using the tool
  const result = await generateText({
    model: {} as any,
    prompt: 'What is the weather?',
    tools: { weather: weatherTool },
  });

  return result;
}

/**
 * VIOLATION Example 10: Chained Calls Without Error Handling
 * Expected Violation: Multiple API calls without any error handling
 */
async function chainedCallsNoErrorHandling() {
  // ❌ Multiple API calls, all without error handling
  const text = await generateText({
    model: {} as any,
    prompt: 'First prompt',
  });

  const object = await generateObject({
    model: {} as any,
    schema: z.object({ result: z.string() }),
    prompt: text.text,
  });

  const embedding = await embed({
    model: {} as any,
    value: object.object.result,
  });

  return embedding.embedding;
}

// These examples SHOULD trigger contract violations
export {
  generateTextNoErrorHandling,
  streamTextNoErrorHandler,
  generateObjectNoValidation,
  streamObjectNoErrorHandler,
  embedNoErrorHandling,
  embedManyNoErrorHandling,
  generateTextInvalidRequest,
  generateTextContentFilter,
  toolNoErrorHandling,
  chainedCallsNoErrorHandling,
};
