/**
 * Fixtures demonstrating MISSING error handling for @langchain/openai.
 * These SHOULD trigger ERROR violations.
 */
import { ChatOpenAI, OpenAIEmbeddings, DallEAPIWrapper } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

// ❌ Missing: ChatOpenAI.invoke() without try-catch
async function chatWithoutErrorHandling() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4o' });
  const response = await model.invoke([new HumanMessage('Hello, world!')]);
  return response.content;
}

// ❌ Missing: ChatOpenAI.invoke() with string input, no try-catch
async function chatStringInputNoErrorHandling() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await model.invoke('Summarize this text');
  return result;
}

// ❌ Missing: OpenAIEmbeddings.embedDocuments() without try-catch
async function embedDocumentsWithoutErrorHandling(texts: string[]) {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  const vectors = await embeddings.embedDocuments(texts);
  return vectors;
}

// ❌ Missing: OpenAIEmbeddings.embedQuery() without try-catch
async function embedQueryWithoutErrorHandling(query: string) {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  return await embeddings.embedQuery(query);
}

// ❌ Missing: DallEAPIWrapper.invoke() without try-catch
async function generateImageWithoutErrorHandling(prompt: string) {
  const dalle = new DallEAPIWrapper({ apiKey: process.env.OPENAI_API_KEY, model: 'dall-e-3' });
  const imageUrl = await dalle.invoke(prompt);
  return imageUrl;
}
