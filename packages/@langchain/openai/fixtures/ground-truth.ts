/**
 * Ground-truth fixture for @langchain/openai
 *
 * Annotations use the format:
 * // SHOULD_FIRE: <postcondition-id> — <reason>
 * // SHOULD_NOT_FIRE: <reason>
 *
 * Each annotation applies to the NEXT line (the call site detected by the scanner).
 */
import { ChatOpenAI, OpenAI, AzureOpenAI, OpenAIEmbeddings, DallEAPIWrapper } from '@langchain/openai';
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

// ─── ChatOpenAI.stream() — connection error (no try-catch) ────────────────

// @expect-violation: stream-connection-error
// @expect-violation: stream-iteration-error
async function chatStreamNoTryCatch() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: stream-connection-error — await model.stream() called without try-catch; stream-iteration-error sub-violation expected for the unguarded for-await-of loop
  const stream = await model.stream([new HumanMessage('Hello')]);
  let fullContent = '';
  for await (const chunk of stream) {
    fullContent += chunk.content;
  }
  return fullContent;
}

// @expect-clean
async function chatStreamWithFullTryCatch() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_NOT_FIRE: try-catch wraps BOTH await model.stream() AND for-await-of loop
  try {
    const stream = await model.stream([new HumanMessage('Hello')]);
    let fullContent = '';
    for await (const chunk of stream) {
      fullContent += chunk.content;
    }
    return fullContent;
  } catch (error) {
    throw error;
  }
}

// @expect-violation: stream-iteration-error
async function chatStreamTryCatchOnlyAroundAwait() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let stream;
  try {
    stream = await model.stream([new HumanMessage('Hello')]);
  } catch (error) {
    throw error;
  }
  let fullContent = '';
  // FUTURE_SHOULD_FIRE: stream-iteration-error — analyzer doesn't yet treat `for await (const x of stream)` as a contracted call site for ChatOpenAI.stream iteration errors; needs async-iteration scope analysis (qt-62 triage section 2, L-effort scanner upgrade).
  for await (const chunk of stream) {
    fullContent += chunk.content;
  }
  return fullContent;
}

// ─── ChatOpenAI.moderateContent() — no try-catch ──────────────────────────

// @expect-violation: moderation-network-error
async function moderateContentNoTryCatch() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: moderation-network-error — moderateContent() called without try-catch; API failure silently skips the safety check
  const result = await model.moderateContent('User submitted text');
  if (result.results[0].flagged) {
    throw new Error('Content policy violation');
  }
  return result;
}

// @expect-clean
async function moderateContentWithTryCatch() {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_NOT_FIRE: moderateContent() is inside try-catch with fail-safe error handling
  try {
    const result = await model.moderateContent('User submitted text');
    if (result.results[0].flagged) {
      throw new Error('Content policy violation');
    }
    return result;
  } catch (error) {
    // Fail safe — block content on moderation failure
    throw new Error('Content moderation failed — content blocked for safety');
  }
}

// ─── OpenAI (legacy text-completion LLM) — no try-catch ───────────────────

async function legacyOpenAIInvokeNoTryCatch() {
  const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // SHOULD_FIRE: llm-invoke-network-error
  const response = await llm.invoke('Tell me a joke.');
  return response;
}

async function legacyOpenAIInvokeWithTryCatch() {
  const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // SHOULD_NOT_FIRE: legacy OpenAI.invoke() inside try-catch
    const response = await llm.invoke('Tell me a joke.');
    return response;
  } catch (error) {
    throw error;
  }
}

// ─── AzureOpenAI (legacy LLM, extends OpenAI) — no try-catch ──────────────

async function azureLegacyOpenAIInvokeNoTryCatch() {
  const llm = new AzureOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiDeploymentName: 'gpt-35-turbo-instruct',
    azureOpenAIApiVersion: '2024-02-01',
  });
  // SHOULD_FIRE: llm-invoke-network-error
  return await llm.invoke('Summarize this text.');
}
