/**
 * Axios Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the axios contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - axios.get/post/put/delete/request all throw AxiosError on 4xx/5xx/network → MUST try-catch
 *   - postconditions with `throws` at severity:error require a try-catch wrapper
 *   - A try-catch wrapper (any catch block) satisfies the "must try-catch" requirement
 *   - catch-block completeness (429 handling, network vs HTTP distinction) generates warnings only
 */

import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare call — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function bareGetNoCatch() {
  // SHOULD_FIRE: error-4xx-5xx — axios.get throws AxiosError, no try-catch
  const r = await axios.get("https://api.example.com/users");
  return r.data;
}

export async function barePostNoCatch(data: object) {
  // SHOULD_FIRE: error-4xx-5xx — axios.post throws AxiosError, no try-catch
  const r = await axios.post("https://api.example.com/users", data);
  return r.data;
}

export async function barePutNoCatch(id: string, data: object) {
  // SHOULD_FIRE: error-4xx-5xx — axios.put throws AxiosError, no try-catch
  const r = await axios.put(`https://api.example.com/users/${id}`, data);
  return r.data;
}

export async function bareDeleteNoCatch(id: string) {
  // SHOULD_FIRE: error-4xx-5xx — axios.delete throws AxiosError, no try-catch
  const r = await axios.delete(`https://api.example.com/users/${id}`);
  return r.data;
}

export async function bareRequestNoCatch() {
  // SHOULD_FIRE: error-4xx-5xx — axios.request throws AxiosError, no try-catch
  const r = await axios.request({
    method: "GET",
    url: "https://api.example.com/data",
  });
  return r.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Properly wrapped in try-catch — no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function getWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: axios.get is inside try-catch — error-4xx-5xx requirement satisfied
    const r = await axios.get("https://api.example.com/users");
    return r.data;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
}

export async function postWithTryCatch(data: object) {
  try {
    // SHOULD_NOT_FIRE: axios.post is inside try-catch — error-4xx-5xx requirement satisfied
    const r = await axios.post("https://api.example.com/users", data);
    return r.data;
  } catch (err: any) {
    throw err;
  }
}

export async function getWithResponseCheck() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch; catch checks error.response — network-failure handled
    const r = await axios.get("https://api.example.com/data");
    return r.data;
  } catch (err: any) {
    if (err.response) {
      console.error("HTTP error:", err.response.status);
    } else {
      console.error("Network error:", err.message);
    }
    throw err;
  }
}

export async function getWith429Handling() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch; catch handles 429 explicitly
    const r = await axios.get("https://api.example.com/data");
    return r.data;
  } catch (err: any) {
    if (err.response?.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Arrow functions
// ─────────────────────────────────────────────────────────────────────────────

export const arrowGetNoCatch = async () => {
  // SHOULD_FIRE: error-4xx-5xx — arrow function, no try-catch
  const r = await axios.get("https://api.example.com/data");
  return r.data;
};

export const arrowGetWithCatch = async () => {
  try {
    // SHOULD_NOT_FIRE: arrow function with try-catch is safe
    const r = await axios.get("https://api.example.com/data");
    return r.data;
  } catch (err) {
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Class methods
// ─────────────────────────────────────────────────────────────────────────────

export class ApiClient {
  async fetchUser(id: string) {
    // SHOULD_FIRE: error-4xx-5xx — class method, no try-catch
    const r = await axios.get(`https://api.example.com/users/${id}`);
    return r.data;
  }

  async safeCreateUser(data: object) {
    try {
      // SHOULD_NOT_FIRE: class method wrapped in try-catch
      const r = await axios.post("https://api.example.com/users", data);
      return r.data;
    } catch (err: any) {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. .catch() chain — satisfies the try-catch requirement
// ─────────────────────────────────────────────────────────────────────────────

export function getWithCatchChain() {
  // SHOULD_NOT_FIRE: .catch() chained on the promise satisfies error handling
  return axios.get("https://api.example.com/data").catch((err) => {
    console.error(err);
    throw err;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Multiple calls in same function
// ─────────────────────────────────────────────────────────────────────────────

export async function multipleBareCalls() {
  // SHOULD_FIRE: error-4xx-5xx — first call, no try-catch
  const users = await axios.get("https://api.example.com/users");
  // SHOULD_FIRE: error-4xx-5xx — second call, no try-catch
  const posts = await axios.get("https://api.example.com/posts");
  return { users: users.data, posts: posts.data };
}

export async function mixedCoverage() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    const users = await axios.get("https://api.example.com/users");
    return users.data;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Nested try blocks
// ─────────────────────────────────────────────────────────────────────────────

export async function nestedTryCatch() {
  try {
    try {
      // SHOULD_NOT_FIRE: nested inside try-catch — innermost try-catch satisfies requirement
      const r = await axios.get("https://api.example.com/data");
      return r.data;
    } catch (inner) {
      throw inner;
    }
  } catch (outer) {
    throw outer;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Axios instance (created via axios.create)
// ─────────────────────────────────────────────────────────────────────────────

const httpClient = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5000,
});

export async function instanceGetNoCatch() {
  // SHOULD_FIRE: error-4xx-5xx — axios instance.get, no try-catch
  const r = await httpClient.get("/users");
  return r.data;
}

export async function instanceGetWithCatch() {
  try {
    // SHOULD_NOT_FIRE: axios instance.get inside try-catch
    const r = await httpClient.get("/users");
    return r.data;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Re-throw patterns
// ─────────────────────────────────────────────────────────────────────────────

export async function rethrowPattern() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, even if catch re-throws (handling exists at this level)
    const r = await axios.get("https://api.example.com/data");
    return r.data;
  } catch (err) {
    // Re-throw is valid — caller handles it
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. try-finally without catch — no catch clause, SHOULD still fire
// ─────────────────────────────────────────────────────────────────────────────

export async function tryFinallyNoCatch() {
  try {
    // SHOULD_FIRE: error-4xx-5xx — try-finally has no catch clause, errors are NOT caught
    const r = await axios.get("https://api.example.com/data");
    return r.data;
  } finally {
    console.log("cleanup");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. axios.patch() — partial update (added in depth pass 2026-04-02)
// @expect-violation: patch-error-4xx-5xx
// @expect-violation: patch-network-failure
// ─────────────────────────────────────────────────────────────────────────────

export async function barePatchNoCatch(id: string, data: object) {
  // SHOULD_FIRE: patch-error-4xx-5xx — axios.patch throws AxiosError, no try-catch
  const r = await axios.patch(`https://api.example.com/users/${id}`, data);
  return r.data;
}

// @expect-clean
export async function patchWithTryCatch(id: string, data: object) {
  try {
    // SHOULD_NOT_FIRE: axios.patch inside try-catch — requirement satisfied
    const r = await axios.patch(`https://api.example.com/users/${id}`, data);
    return r.data;
  } catch (err: any) {
    if (err.response) {
      console.error("PATCH error:", err.response.status, err.response.data);
    } else {
      console.error("Network error:", err.message);
    }
    throw err;
  }
}

export async function instancePatchNoCatch(id: string, data: object) {
  // SHOULD_FIRE: patch-error-4xx-5xx — axios instance.patch, no try-catch
  const r = await httpClient.patch(`/users/${id}`, data);
  return r.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. axios.head() — existence check without body (added in depth pass 2026-04-02)
// @expect-violation: head-error-4xx-5xx
// @expect-violation: head-network-failure
// ─────────────────────────────────────────────────────────────────────────────

export async function bareHeadNoCatch(url: string) {
  // SHOULD_FIRE: head-error-4xx-5xx — axios.head throws AxiosError on 4xx/5xx, no try-catch
  const r = await axios.head(url);
  return r.headers;
}

// @expect-clean
export async function headWithTryCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: axios.head inside try-catch
    const r = await axios.head(url);
    return r.headers;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null; // Resource does not exist
    }
    throw err;
  }
}

// @expect-clean
export async function headExistenceCheck(url: string): Promise<boolean> {
  try {
    // SHOULD_NOT_FIRE: correct pattern for checking resource existence via HEAD
    await axios.head(url);
    return true;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return false;
    }
    throw err; // Re-throw unexpected errors
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. axios.postForm() — file upload (added in depth pass 2026-04-02)
// @expect-violation: postform-error-4xx-5xx
// @expect-violation: postform-payload-too-large-413
// @expect-violation: postform-network-failure
// ─────────────────────────────────────────────────────────────────────────────

export async function barePostFormNoCatch(file: File) {
  // SHOULD_FIRE: postform-error-4xx-5xx — axios.postForm throws AxiosError, no try-catch
  const r = await axios.postForm("https://api.example.com/upload", { file });
  return r.data;
}

// @expect-clean
export async function postFormWithTryCatch(file: File) {
  try {
    // SHOULD_NOT_FIRE: axios.postForm inside try-catch with 413 handling
    const r = await axios.postForm("https://api.example.com/upload", { file });
    return r.data;
  } catch (err: any) {
    if (err.response?.status === 413) {
      throw new Error("File too large. Please upload a file smaller than 10MB.");
    }
    if (err.response?.status === 415) {
      throw new Error("Unsupported file type.");
    }
    if (!err.response) {
      throw new Error("Upload failed: network error. Please try again.");
    }
    throw err;
  }
}

export async function instancePostFormNoCatch(data: object) {
  // SHOULD_FIRE: postform-error-4xx-5xx — axios instance.postForm, no try-catch
  const r = await httpClient.postForm("/upload", data);
  return r.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. axios.putForm() — file replacement (added in depth pass 2026-04-02)
// @expect-violation: putform-error-4xx-5xx
// @expect-violation: putform-network-failure
// ─────────────────────────────────────────────────────────────────────────────

export async function barePutFormNoCatch(id: string, file: File) {
  // SHOULD_FIRE: putform-error-4xx-5xx — axios.putForm throws AxiosError, no try-catch
  const r = await axios.putForm(`https://api.example.com/files/${id}`, { file });
  return r.data;
}

// @expect-clean
export async function putFormWithTryCatch(id: string, file: File) {
  try {
    // SHOULD_NOT_FIRE: axios.putForm inside try-catch
    const r = await axios.putForm(`https://api.example.com/files/${id}`, { file });
    return r.data;
  } catch (err: any) {
    if (err.response?.status === 413) {
      throw new Error("File too large for replacement.");
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. axios.patchForm() — partial update with file (added in depth pass 2026-04-02)
// @expect-violation: patchform-error-4xx-5xx
// @expect-violation: patchform-network-failure
// ─────────────────────────────────────────────────────────────────────────────

export async function barePatchFormNoCatch(id: string, avatar: File) {
  // SHOULD_FIRE: patchform-error-4xx-5xx — axios.patchForm throws AxiosError, no try-catch
  const r = await axios.patchForm(`https://api.example.com/users/${id}`, { avatar });
  return r.data;
}

// @expect-clean
export async function patchFormWithTryCatch(id: string, avatar: File) {
  try {
    // SHOULD_NOT_FIRE: axios.patchForm inside try-catch
    const r = await axios.patchForm(`https://api.example.com/users/${id}`, { avatar });
    return r.data;
  } catch (err: any) {
    if (err.response?.status === 413) {
      throw new Error("Avatar file too large. Max 5MB.");
    }
    if (!err.response) {
      throw new Error("Upload failed: network error.");
    }
    throw err;
  }
}
