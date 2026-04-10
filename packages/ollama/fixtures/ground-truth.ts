/**
 * ollama Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ollama"):
 *   - ollama.chat(...)     postcondition: chat-no-try-catch
 *   - ollama.generate(...) postcondition: generate-no-try-catch
 *   - ollama.embed(...)    postcondition: embed-no-try-catch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires .chat/.generate/.embed without try-catch
 */

import Ollama from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

// ─────────────────────────────────────────────────────────────────────────────
// 1. chat() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function chatNoCatch() {
  // SHOULD_FIRE: chat-no-try-catch — ollama.chat() makes HTTP request; if Ollama server is down or model not found, throws unhandled Error
  const response = await ollama.chat({
    model: "llama3.2",
    messages: [{ role: "user", content: "Hello" }],
  });
  return response.message.content;
}

export async function chatWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.chat() inside try-catch satisfies error handling requirement
    const response = await ollama.chat({
      model: "llama3.2",
      messages: [{ role: "user", content: "Hello" }],
    });
    return response.message.content;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. generate() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function generateNoCatch() {
  // SHOULD_FIRE: generate-no-try-catch — ollama.generate() throws on connection failure or model not found
  const response = await ollama.generate({
    model: "llama3.2",
    prompt: "Hello",
  });
  return response.response;
}

export async function generateWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.generate() inside try-catch satisfies error handling requirement
    const response = await ollama.generate({
      model: "llama3.2",
      prompt: "Hello",
    });
    return response.response;
  } catch (error) {
    console.error("Generate error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. embed() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function embedNoCatch() {
  // SHOULD_FIRE: embed-no-try-catch — ollama.embed() throws on server unavailability or invalid model
  const response = await ollama.embed({
    model: "nomic-embed-text",
    input: "test text",
  });
  return response.embeddings;
}

export async function embedWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.embed() inside try-catch satisfies error handling requirement
    const response = await ollama.embed({
      model: "nomic-embed-text",
      input: "test text",
    });
    return response.embeddings;
  } catch (error) {
    console.error("Embed error:", error);
    throw error;
  }
}
