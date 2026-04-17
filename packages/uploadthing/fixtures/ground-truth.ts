/**
 * uploadthing Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "uploadthing/server"):
 *   - utapi.uploadFiles(...)        postcondition: upload-files-no-try-catch, upload-files-result-error-unchecked
 *   - utapi.uploadFilesFromUrl(...) postcondition: upload-from-url-no-try-catch, upload-from-url-data-url-rejected
 *   - utapi.deleteFiles(...)        postcondition: delete-files-no-try-catch
 *   - utapi.generateSignedURL(...)  postcondition: generate-signed-url-no-try-catch
 *   - utapi.renameFiles(...)        postcondition: rename-files-no-try-catch
 *   - utapi.updateACL(...)          postcondition: update-acl-no-try-catch
 *   - utapi.listFiles(...)          postcondition: list-files-no-try-catch
 *   - utapi.getUsageInfo(...)       postcondition: get-usage-info-no-try-catch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires .uploadFiles/.deleteFiles etc. without try-catch
 *
 * Depth pass: 2026-04-17 (deepen-stream-2 pass 4)
 */

import { UTApi, UploadThingError } from "uploadthing/server";

const utapi = new UTApi();

// ─────────────────────────────────────────────────────────────────────────────
// 1. uploadFiles() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadFilesNoCatch(file: File) {
  // SHOULD_FIRE: upload-files-no-try-catch — utapi.uploadFiles() makes HTTP request; throws UploadThingError on failure
  const result = await utapi.uploadFiles(file);
  return result;
}

export async function uploadFilesWithCatch(file: File) {
  try {
    // SHOULD_NOT_FIRE: utapi.uploadFiles() inside try-catch satisfies UploadThingError handling
    const result = await utapi.uploadFiles(file);
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. deleteFiles() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteFilesNoCatch(keys: string[]) {
  // SHOULD_FIRE: delete-files-no-try-catch — utapi.deleteFiles() makes HTTP request; throws UploadThingError on failure
  const result = await utapi.deleteFiles(keys);
  return result;
}

export async function deleteFilesWithCatch(keys: string[]) {
  try {
    // SHOULD_NOT_FIRE: utapi.deleteFiles() inside try-catch satisfies UploadThingError handling
    const result = await utapi.deleteFiles(keys);
    return result;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. uploadFilesFromUrl() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: upload-from-url-no-try-catch
export async function uploadFromUrlNoCatch(url: string) {
  // SHOULD_FIRE: upload-from-url-no-try-catch — makes HTTP download + upload; throws UploadThingError on config failure
  const result = await utapi.uploadFilesFromUrl(url);
  return result;
}

// @expect-clean
export async function uploadFromUrlWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies UploadThingError handling
    const result = await utapi.uploadFilesFromUrl(url);
    if (result.error) {
      console.error("Upload from URL failed:", result.error.code);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error("Upload from URL configuration error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. generateSignedURL() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: generate-signed-url-no-try-catch
export async function generateSignedUrlNoCatch(key: string) {
  // SHOULD_FIRE: generate-signed-url-no-try-catch — throws BAD_REQUEST on invalid expiresIn or MISSING_ENV
  const { ufsUrl } = await utapi.generateSignedURL(key, { expiresIn: "1 hour" });
  return ufsUrl;
}

// @expect-clean
export async function generateSignedUrlWithCatch(key: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies UploadThingError handling
    const { ufsUrl } = await utapi.generateSignedURL(key, { expiresIn: "1 hour" });
    return ufsUrl;
  } catch (error) {
    if (error instanceof UploadThingError) {
      console.error("Signed URL generation failed:", error.code, error.message);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. renameFiles() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: rename-files-no-try-catch
export async function renameFilesNoCatch(fileKey: string, newName: string) {
  // SHOULD_FIRE: rename-files-no-try-catch — makes HTTPS POST to /v6/renameFiles; throws UploadThingError on failure
  const result = await utapi.renameFiles({ fileKey, newName });
  return result;
}

// @expect-clean
export async function renameFilesWithCatch(fileKey: string, newName: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies UploadThingError handling
    const { success } = await utapi.renameFiles({ fileKey, newName });
    if (!success) {
      console.warn("Rename reported unsuccessful");
    }
    return success;
  } catch (error) {
    console.error("Rename failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. updateACL() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: update-acl-no-try-catch
export async function updateAclNoCatch(keys: string[]) {
  // SHOULD_FIRE: update-acl-no-try-catch — makes HTTPS POST to /v6/updateACL; throws UploadThingError on failure
  const result = await utapi.updateACL(keys, "private");
  return result;
}

// @expect-clean
export async function updateAclWithCatch(keys: string[]) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies UploadThingError handling
    await utapi.updateACL(keys, "private");
  } catch (error) {
    if (error instanceof UploadThingError && error.code === "FORBIDDEN") {
      throw new Error("Cannot update ACL: check UploadThing app settings");
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. listFiles() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: list-files-no-try-catch
export async function listFilesNoCatch() {
  // SHOULD_FIRE: list-files-no-try-catch — makes HTTPS POST to /v6/listFiles; throws UploadThingError on failure
  const { files, hasMore } = await utapi.listFiles({ limit: 100 });
  return { files, hasMore };
}

// @expect-clean
export async function listFilesWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies UploadThingError handling
    const { files, hasMore } = await utapi.listFiles({ limit: 100 });
    return { files, hasMore };
  } catch (error) {
    if (error instanceof UploadThingError) {
      console.error("List files failed:", error.code, error.message);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. getUsageInfo() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: get-usage-info-no-try-catch
export async function getUsageInfoNoCatch() {
  // SHOULD_FIRE: get-usage-info-no-try-catch — makes HTTPS POST to /v6/getUsageInfo; throws UploadThingError on failure
  const info = await utapi.getUsageInfo();
  return info;
}

// @expect-clean
export async function getUsageInfoWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies UploadThingError handling
    const { filesUploaded, limitBytes, appTotalBytes } = await utapi.getUsageInfo();
    return { filesUploaded, limitBytes, appTotalBytes };
  } catch (error) {
    console.error("Failed to get usage info:", error);
    return null;
  }
}
