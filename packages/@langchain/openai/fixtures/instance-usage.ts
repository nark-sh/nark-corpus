/**
 * Fixtures demonstrating instance-based usage patterns for @langchain/openai.
 * Tests detection via class instances and chained calls.
 */
import { ChatOpenAI, OpenAIEmbeddings, DallEAPIWrapper } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// ❌ Instance usage: model stored as class field, invoke called without try-catch
class ContentGenerationService {
  private model: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private dalle: DallEAPIWrapper;

  constructor() {
    this.model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4o' });
    this.embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
    this.dalle = new DallEAPIWrapper({ apiKey: process.env.OPENAI_API_KEY });
  }

  // ❌ Missing try-catch on model.invoke via instance
  async generateContent(prompt: string) {
    const response = await this.model.invoke([
      new SystemMessage('You are a helpful assistant.'),
      new HumanMessage(prompt),
    ]);
    return response.content;
  }

  // ❌ Missing try-catch on embeddings.embedQuery via instance
  async getEmbedding(text: string) {
    return await this.embeddings.embedQuery(text);
  }

  // ❌ Missing try-catch on dalle.invoke via instance
  async generateImage(prompt: string) {
    return await this.dalle.invoke(prompt);
  }
}

// ❌ Chain pattern: .pipe(model).invoke() without try-catch
async function chainedInvokeNoErrorHandling(input: string) {
  const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const chain = ChatPromptTemplate.fromTemplate('Process this: {input}').pipe(model);
  const result = await chain.invoke({ input });
  return result;
}

// ✅ Instance usage with proper error handling
class SafeContentService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4o' });
  }

  async generateContent(prompt: string) {
    try {
      const response = await this.model.invoke([new HumanMessage(prompt)]);
      return response.content;
    } catch (error) {
      console.error('Content generation failed:', error);
      throw error;
    }
  }
}
