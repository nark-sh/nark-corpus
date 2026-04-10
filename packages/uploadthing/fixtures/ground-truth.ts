/**
 * uploadthing Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "uploadthing/server"):
 *   - utapi.uploadFiles(...)  postcondition: upload-files-no-try-catch
 *   - utapi.deleteFiles(...)  postcondition: delete-files-no-try-catch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires .uploadFiles/.deleteFiles without try-catch
 */

import { UTApi } from "uploadthing/server";

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
