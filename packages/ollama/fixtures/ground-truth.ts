/**
 * ollama Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ollama"):
 *   - ollama.chat(...)       postcondition: chat-no-try-catch
 *   - ollama.generate(...)   postcondition: generate-no-try-catch
 *   - ollama.embed(...)      postcondition: embed-no-try-catch
 *   - ollama.pull(...)       postconditions: pull-no-try-catch, pull-model-not-found
 *   - ollama.create(...)     postconditions: create-no-try-catch, create-local-path-unsupported
 *   - ollama.show(...)       postcondition: show-no-try-catch
 *   - ollama.delete(...)     postcondition: delete-no-try-catch
 *   - ollama.copy(...)       postcondition: copy-no-try-catch
 *   - ollama.webSearch(...)  postconditions: websearch-no-try-catch, websearch-missing-api-key
 *   - ollama.webFetch(...)   postcondition: webfetch-no-try-catch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires .chat/.generate/.embed/.pull/.create/.show/.delete/.copy/.webSearch/.webFetch without try-catch
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. pull() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: pull-no-try-catch
export async function pullNoCatch() {
  // SHOULD_FIRE: pull-no-try-catch — ollama.pull() makes HTTP request; throws ResponseError(404) for
  // unknown model names, ECONNREFUSED when Ollama server is not running, AbortError mid-download
  const response = await ollama.pull({ model: "llama3.2" });
  return response.status;
}

// @expect-clean
export async function pullWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.pull() inside try-catch satisfies error handling requirement
    const response = await ollama.pull({ model: "llama3.2" });
    return response.status;
  } catch (error) {
    console.error("Pull error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. create() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: create-no-try-catch
export async function createNoCatch() {
  // SHOULD_FIRE: create-no-try-catch — ollama.create() throws ResponseError(404) when base model not found;
  // also throws Error("Creating with a local path is not currently supported from ollama-js") for local paths
  const response = await ollama.create({
    model: "my-custom-model",
    from: "llama3.2",
    system: "You are a helpful assistant.",
  });
  return response.status;
}

// @expect-clean
export async function createWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.create() inside try-catch satisfies error handling requirement
    const response = await ollama.create({
      model: "my-custom-model",
      from: "llama3.2",
      system: "You are a helpful assistant.",
    });
    return response.status;
  } catch (error) {
    console.error("Create error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. show() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: show-no-try-catch
export async function showNoCatch() {
  // SHOULD_FIRE: show-no-try-catch — ollama.show() throws ResponseError(404) when model not found;
  // silent failure in capability-check flows where callers assume the model exists
  const info = await ollama.show({ model: "llama3.2" });
  return info.details;
}

// @expect-clean
export async function showWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.show() inside try-catch satisfies error handling requirement
    const info = await ollama.show({ model: "llama3.2" });
    return info.details;
  } catch (error) {
    console.error("Show error:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. delete() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: delete-no-try-catch
export async function deleteNoCatch() {
  // SHOULD_FIRE: delete-no-try-catch — ollama.delete() throws ResponseError(404) when model not found;
  // common in cleanup flows where model may already have been removed
  const result = await ollama.delete({ model: "old-model" });
  return result.status;
}

// @expect-clean
export async function deleteWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.delete() inside try-catch satisfies error handling requirement
    const result = await ollama.delete({ model: "old-model" });
    return result.status;
  } catch (error: any) {
    // 404 means model already deleted — acceptable in cleanup flows
    if (error.status_code === 404) return "not-found";
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. copy() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: copy-no-try-catch
export async function copyNoCatch() {
  // SHOULD_FIRE: copy-no-try-catch — ollama.copy() throws ResponseError(404) when source model not found
  const result = await ollama.copy({ source: "llama3.2", destination: "llama3.2-backup" });
  return result.status;
}

// @expect-clean
export async function copyWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.copy() inside try-catch satisfies error handling requirement
    const result = await ollama.copy({ source: "llama3.2", destination: "llama3.2-backup" });
    return result.status;
  } catch (error) {
    console.error("Copy error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. webSearch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: websearch-no-try-catch
export async function webSearchNoCatch() {
  // SHOULD_FIRE: websearch-no-try-catch — ollama.webSearch() throws Error("Query is required") for empty
  // queries, ResponseError(401) when OLLAMA_API_KEY is missing; calls external ollama.com cloud API
  const results = await ollama.webSearch({ query: "latest AI news" });
  return results.results;
}

// @expect-clean
export async function webSearchWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.webSearch() inside try-catch satisfies error handling requirement
    const results = await ollama.webSearch({ query: "latest AI news" });
    return results.results;
  } catch (error: any) {
    if (error.message === "Query is required") {
      throw new Error("Search query cannot be empty");
    }
    if (error.status_code === 401) {
      throw new Error("Ollama API key not configured — set OLLAMA_API_KEY");
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. webFetch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: webfetch-no-try-catch
export async function webFetchNoCatch() {
  // SHOULD_FIRE: webfetch-no-try-catch — ollama.webFetch() throws Error("URL is required") for empty URL,
  // ResponseError(401) when OLLAMA_API_KEY is missing; calls external ollama.com cloud API
  const page = await ollama.webFetch({ url: "https://ollama.com" });
  return page.content;
}

// @expect-clean
export async function webFetchWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ollama.webFetch() inside try-catch satisfies error handling requirement
    const page = await ollama.webFetch({ url: "https://ollama.com" });
    return page.content;
  } catch (error: any) {
    if (error.message === "URL is required") {
      throw new Error("Fetch URL cannot be empty");
    }
    if (error.status_code === 401) {
      throw new Error("Ollama API key not configured — set OLLAMA_API_KEY");
    }
    throw error;
  }
}
