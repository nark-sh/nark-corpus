import { $fetch } from "ofetch";

/**
 * Tests instance-based usage via $fetch.create()
 */
const myFetch = $fetch.create({
  baseURL: "https://api.example.com",
});

/**
 * ❌ Should trigger violation: ofetch-no-try-catch
 */
async function fetchUsersNoCatch() {
  const data = await myFetch("/users");
  return data;
}

/**
 * ✅ Should NOT trigger violation
 */
async function fetchUsersSafe() {
  try {
    const data = await myFetch("/users");
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

export { fetchUsersNoCatch, fetchUsersSafe };
