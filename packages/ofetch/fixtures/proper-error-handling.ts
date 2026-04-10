import { ofetch, $fetch } from "ofetch";

/**
 * Proper error handling for ofetch()
 * Should NOT trigger any violations.
 */
async function fetchWithProperErrorHandling() {
  try {
    const data = await ofetch("/api/users");
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}

/**
 * Proper error handling for $fetch()
 * Should NOT trigger any violations.
 */
async function dollarFetchWithProperErrorHandling() {
  try {
    const data = await $fetch("/api/data", {
      method: "POST",
      body: { key: "value" },
    });
    return data;
  } catch (error) {
    console.error("$fetch failed:", error);
    throw error;
  }
}

export { fetchWithProperErrorHandling, dollarFetchWithProperErrorHandling };
