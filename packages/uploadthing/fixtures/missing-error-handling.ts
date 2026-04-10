import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Missing error handling for UTApi.uploadFiles()
 * Should trigger ERROR violation: upload-files-no-try-catch
 */
async function uploadFilesWithoutErrorHandling(file: File) {
  // ❌ No try/catch — UploadThingError thrown on upload failure, quota exceeded, etc.
  const result = await utapi.uploadFiles(file);
  return result;
}

/**
 * Missing error handling for UTApi.deleteFiles()
 * Should trigger ERROR violation: delete-files-no-try-catch
 */
async function deleteFilesWithoutErrorHandling(keys: string[]) {
  // ❌ No try/catch — UploadThingError thrown on network failure or invalid keys
  const result = await utapi.deleteFiles(keys);
  return result;
}

export { uploadFilesWithoutErrorHandling, deleteFilesWithoutErrorHandling };
