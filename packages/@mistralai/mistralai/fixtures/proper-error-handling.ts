/**
 * Proper error handling for @mistralai/mistralai.
 * All API calls are wrapped in try-catch or .catch(). Should produce 0 violations.
 */
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// ✅ chat.complete with try-catch
async function chatComplete(userMessage: string) {
  try {
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

// ✅ chat.stream with try-catch
async function* chatStream(userMessage: string) {
  try {
    const stream = await client.chat.stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    });
    for await (const chunk of stream) {
      yield chunk.data.choices[0]?.delta?.content ?? '';
    }
  } catch (error) {
    console.error('Mistral stream error:', error);
    throw error;
  }
}

// ✅ chat.complete with .catch() chain
async function chatCompleteWithCatch(userMessage: string) {
  const response = await client.chat
    .complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: userMessage }],
    })
    .catch((error) => {
      console.error('Mistral error:', error);
      throw error;
    });
  return response.choices?.[0]?.message?.content ?? '';
}

// ✅ chat.stream with .catch() — pattern from cline
async function* chatStreamWithCatch(userMessage: string) {
  const stream = await client.chat
    .stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    })
    .catch((error) => {
      console.error('Stream error:', error);
      throw error;
    });
  for await (const chunk of stream) {
    yield chunk.data.choices[0]?.delta?.content ?? '';
  }
}

// ✅ fim.complete with try-catch
async function codeCompletion(prefix: string, suffix: string) {
  try {
    const response = await client.fim.complete({
      model: 'codestral-latest',
      prompt: prefix,
      suffix: suffix,
    });
    return response.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('FIM completion error:', error);
    throw error;
  }
}
