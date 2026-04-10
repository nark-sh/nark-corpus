/**
 * Fixtures demonstrating PROPER error handling for @langchain/openai.
 * These should NOT trigger any violations.
 */
import { ChatOpenAI, OpenAIEmbeddings, DallEAPIWrapper } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

// ✅ Proper: ChatOpenAI.invoke() wrapped in try-catch
async function chatWithProperErrorHandling() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4o' });
  try {
    const response = await model.invoke([new HumanMessage('Hello, world!')]);
    return response.content;
  } catch (error) {
    console.error('LLM invocation failed:', error);
    throw error;
  }
}

// ✅ Proper: Chain invoke() wrapped in try-catch
async function chainInvokeWithErrorHandling() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const result = await model.invoke('Summarize this text');
    return result;
  } catch (error) {
    if ((error as any).name === 'TimeoutError') {
      throw new Error('Request timed out — please retry');
    }
    throw error;
  }
}

// ✅ Proper: OpenAIEmbeddings.embedDocuments() wrapped in try-catch
async function embedWithProperErrorHandling(texts: string[]) {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const vectors = await embeddings.embedDocuments(texts);
    return vectors;
  } catch (error) {
    console.error('Embedding failed:', error);
    throw error;
  }
}

// ✅ Proper: OpenAIEmbeddings.embedQuery() wrapped in try-catch
async function embedQueryWithErrorHandling(query: string) {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  try {
    return await embeddings.embedQuery(query);
  } catch (error) {
    console.error('Query embedding failed:', error);
    throw error;
  }
}

// ✅ Proper: DallEAPIWrapper.invoke() wrapped in try-catch
async function generateImageWithErrorHandling(prompt: string) {
  const dalle = new DallEAPIWrapper({ apiKey: process.env.OPENAI_API_KEY, model: 'dall-e-3' });
  try {
    const imageUrl = await dalle.invoke(prompt);
    return imageUrl;
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
}
