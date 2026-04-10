/**
 * Missing error handling for @mistralai/mistralai.
 * All API calls lack try-catch. Should produce multiple ERROR violations.
 */
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// ❌ chat.complete without try-catch — violation
async function chatComplete(userMessage: string) {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.choices?.[0]?.message?.content ?? '';
}

// ❌ chat.stream without try-catch — violation
async function* chatStream(userMessage: string) {
  const stream = await client.chat.stream({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: userMessage }],
  });
  for await (const chunk of stream) {
    yield chunk.data.choices[0]?.delta?.content ?? '';
  }
}

// ❌ Common real-world antipattern: API route without error handling
async function handleChatRequest(message: string) {
  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: message },
    ],
    maxTokens: 1000,
  });
  return response.choices?.[0]?.message?.content;
}

// ❌ Simple utility function — missing try-catch
async function summarize(text: string) {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'user', content: `Summarize: ${text}` },
    ],
  });
  return response.choices?.[0]?.message?.content ?? '';
}
