/**
 * Ground-truth fixture for @langchain/openai
 *
 * Annotations use the format:
 * // SHOULD_FIRE: <postcondition-id> — <reason>
 * // SHOULD_NOT_FIRE: <reason>
 *
 * Each annotation applies to the NEXT line (the call site detected by the scanner).
 */
import { ChatOpenAI, OpenAIEmbeddings, DallEAPIWrapper } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// ─── ChatOpenAI.invoke() ───────────────────────────────────────────────────

async function chatInvokeNoTryCatch() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: chat-invoke-network-error — invoke() called without try-catch, TimeoutError/RateLimitError propagates
  const response = await model.invoke([new HumanMessage('Hello')]);
  return response.content;
}

async function chatInvokeWithTryCatch() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // SHOULD_NOT_FIRE: invoke() is inside try-catch
    const response = await model.invoke([new HumanMessage('Hello')]);
    return response.content;
  } catch (error) {
    throw error;
  }
}

// ─── OpenAIEmbeddings.embedDocuments() ────────────────────────────────────

async function embedDocumentsNoTryCatch() {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: embeddings-network-error — embedDocuments() called without try-catch
  return await embeddings.embedDocuments(['text 1', 'text 2']);
}

async function embedDocumentsWithTryCatch() {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // SHOULD_NOT_FIRE: embedDocuments() is inside try-catch
    return await embeddings.embedDocuments(['text 1', 'text 2']);
  } catch (error) {
    throw error;
  }
}

// ─── OpenAIEmbeddings.embedQuery() ────────────────────────────────────────

async function embedQueryNoTryCatch() {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: embeddings-network-error — embedQuery() called without try-catch
  return await embeddings.embedQuery('search query');
}

async function embedQueryWithTryCatch() {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // SHOULD_NOT_FIRE: embedQuery() is inside try-catch
    return await embeddings.embedQuery('search query');
  } catch (error) {
    throw error;
  }
}

// ─── DallEAPIWrapper.invoke() ─────────────────────────────────────────────

async function dalleInvokeNoTryCatch() {
  const dalle = new DallEAPIWrapper({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: chat-invoke-network-error — invoke() on DallEAPIWrapper detected as invoke postcondition (scanner cannot distinguish from ChatOpenAI.invoke by functionName alone)
  return await dalle.invoke('A sunset over mountains');
}

async function dalleInvokeWithTryCatch() {
  const dalle = new DallEAPIWrapper({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // SHOULD_NOT_FIRE: invoke() is inside try-catch so no violation
    return await dalle.invoke('A sunset over mountains');
  } catch (error) {
    throw error;
  }
}
