import { UTApi } from "uploadthing/server";

/**
 * Tests instance-based UTApi usage
 */
class FileStorageService {
  private utapi: UTApi;

  constructor() {
    this.utapi = new UTApi();
  }

  /**
   * ❌ Should trigger violation: upload-files-no-try-catch
   */
  async uploadFile(file: File) {
    const result = await this.utapi.uploadFiles(file);
    return result;
  }

  /**
   * ✅ Should NOT trigger violation
   */
  async uploadFileSafe(file: File) {
    try {
      const result = await this.utapi.uploadFiles(file);
      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  /**
   * ❌ Should trigger violation: delete-files-no-try-catch
   */
  async deleteFile(key: string) {
    const result = await this.utapi.deleteFiles(key);
    return result;
  }
}

export { FileStorageService };
