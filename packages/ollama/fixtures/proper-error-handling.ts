import Ollama from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

/**
 * Proper error handling for ollama.chat()
 * Should NOT trigger any violations.
 */
async function chatWithProperErrorHandling() {
  try {
    const response = await ollama.chat({
      model: "llama3.2",
      messages: [{ role: "user", content: "Hello!" }],
    });
    return response.message.content;
  } catch (error) {
    console.error("Ollama chat error:", error);
    throw error;
  }
}

/**
 * Proper error handling for ollama.generate()
 * Should NOT trigger any violations.
 */
async function generateWithProperErrorHandling() {
  try {
    const response = await ollama.generate({
      model: "llama3.2",
      prompt: "Tell me a joke",
    });
    return response.response;
  } catch (error) {
    console.error("Ollama generate error:", error);
    throw error;
  }
}

/**
 * Proper error handling for ollama.embed()
 * Should NOT trigger any violations.
 */
async function embedWithProperErrorHandling() {
  try {
    const response = await ollama.embed({
      model: "nomic-embed-text",
      input: "The sky is blue",
    });
    return response.embeddings;
  } catch (error) {
    console.error("Ollama embed error:", error);
    throw error;
  }
}

export { chatWithProperErrorHandling, generateWithProperErrorHandling, embedWithProperErrorHandling };
