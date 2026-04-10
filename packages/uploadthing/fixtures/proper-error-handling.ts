import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Proper error handling for UTApi.uploadFiles()
 * Should NOT trigger any violations.
 */
async function uploadFilesWithProperErrorHandling(file: File) {
  try {
    const result = await utapi.uploadFiles(file);
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

/**
 * Proper error handling for UTApi.deleteFiles()
 * Should NOT trigger any violations.
 */
async function deleteFilesWithProperErrorHandling(keys: string[]) {
  try {
    const result = await utapi.deleteFiles(keys);
    return result;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}

export { uploadFilesWithProperErrorHandling, deleteFilesWithProperErrorHandling };
