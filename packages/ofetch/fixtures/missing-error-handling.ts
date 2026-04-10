import { ofetch, $fetch } from "ofetch";

/**
 * Missing error handling for ofetch()
 * Should trigger ERROR violation: ofetch-no-try-catch
 */
async function fetchWithoutErrorHandling() {
  // ❌ No try/catch — FetchError thrown on any non-2xx response
  const data = await ofetch("/api/users");
  return data;
}

/**
 * Missing error handling for $fetch()
 * Should trigger ERROR violation: ofetch-no-try-catch
 */
async function dollarFetchWithoutErrorHandling() {
  // ❌ No try/catch — FetchError thrown on any non-2xx response
  const result = await $fetch("/api/submit", {
    method: "POST",
    body: { data: "test" },
  });
  return result;
}

export { fetchWithoutErrorHandling, dollarFetchWithoutErrorHandling };
