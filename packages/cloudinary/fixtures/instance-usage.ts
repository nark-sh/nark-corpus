import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloud_name: 'demo', api_key: 'key', api_secret: 'secret' });

// Test instance usage with uploader
class CloudinaryService {
  private uploader = cloudinary.uploader;

  // ✅ CORRECT: Instance with error handling
  async uploadWithErrorHandling(file: string) {
    try {
      return await this.uploader.upload(file);
    } catch (error) {
      throw error;
    }
  }

  // ❌ VIOLATION: Instance without error handling
  async uploadWithoutErrorHandling(file: string) {
    return await this.uploader.upload(file);
  }
}

// Destructured uploader
const { uploader } = cloudinary;

// ❌ VIOLATION: Destructured without error handling
async function destructuredUploadNoErrorHandling(file: string) {
  return await uploader.upload(file);
}

export { CloudinaryService, destructuredUploadNoErrorHandling };
