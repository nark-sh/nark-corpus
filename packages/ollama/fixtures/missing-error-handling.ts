import Ollama from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

/**
 * Missing error handling for ollama.chat()
 * Should trigger ERROR violation: chat-no-try-catch
 */
async function chatWithoutErrorHandling() {
  // ❌ No try/catch — if Ollama server is down or model not found, unhandled Error
  const response = await ollama.chat({
    model: "llama3.2",
    messages: [{ role: "user", content: "Hello!" }],
  });
  return response.message.content;
}

/**
 * Missing error handling for ollama.generate()
 * Should trigger ERROR violation: generate-no-try-catch
 */
async function generateWithoutErrorHandling() {
  // ❌ No try/catch — connection refused or model not found crashes silently
  const response = await ollama.generate({
    model: "llama3.2",
    prompt: "Tell me a joke",
  });
  return response.response;
}

/**
 * Missing error handling for ollama.embed()
 * Should trigger ERROR violation: embed-no-try-catch
 */
async function embedWithoutErrorHandling() {
  // ❌ No try/catch — embedding failure breaks RAG pipeline silently
  const response = await ollama.embed({
    model: "nomic-embed-text",
    input: "The sky is blue",
  });
  return response.embeddings;
}

export { chatWithoutErrorHandling, generateWithoutErrorHandling, embedWithoutErrorHandling };
