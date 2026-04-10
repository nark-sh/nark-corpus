import { Storage, Bucket, File } from '@google-cloud/storage';

/**
 * Tests detection of @google-cloud/storage usage via instances
 */

// Create instances
const storage = new Storage({ projectId: 'my-project' });
const bucket: Bucket = storage.bucket('my-bucket');
const file: File = bucket.file('my-file.txt');

// ❌ Instance method calls without error handling
async function uploadViaInstance() {
  // bucket instance method - should trigger violation
  await bucket.upload('local-file.txt');
}

async function downloadViaInstance() {
  // file instance method - should trigger violation
  await file.download();
}

async function deleteViaInstance() {
  // file instance method - should trigger violation
  await file.delete();
}

async function saveViaInstance() {
  // file instance method - should trigger violation
  await file.save('data content');
}

async function copyViaInstance() {
  const destFile = bucket.file('copy.txt');
  // file instance method - should trigger violation
  await file.copy(destFile);
}

async function getMetadataViaInstance() {
  // file instance method - should trigger violation
  const [metadata] = await file.getMetadata();
  console.log(metadata);
}

async function listFilesViaInstance() {
  // bucket instance method - should trigger violation
  const [files] = await bucket.getFiles();
  console.log(files.length);
}

async function deleteBucketViaInstance() {
  // bucket instance method - should trigger violation
  await bucket.delete();
}

// ✅ Proper error handling with instances
async function uploadViaInstanceWithTryCatch() {
  try {
    await bucket.upload('local-file.txt');
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

async function downloadViaInstanceWithTryCatch() {
  try {
    await file.download();
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// Class-based usage pattern
class StorageManager {
  private storage: Storage;
  private bucket: Bucket;

  constructor(bucketName: string) {
    this.storage = new Storage();
    this.bucket = this.storage.bucket(bucketName);
  }

  // ❌ Missing error handling in class method
  async upload(localPath: string, remotePath: string) {
    const file = this.bucket.file(remotePath);
    await this.bucket.upload(localPath, { destination: remotePath });
  }

  // ❌ Missing error handling in class method
  async download(remotePath: string, localPath: string) {
    const file = this.bucket.file(remotePath);
    await file.download({ destination: localPath });
  }

  // ✅ Proper error handling in class method
  async deleteWithErrorHandling(remotePath: string) {
    try {
      const file = this.bucket.file(remotePath);
      await file.delete();
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}

// Factory function pattern
function createStorageClient(projectId: string) {
  return new Storage({ projectId });
}

async function useFactoryPattern() {
  const client = createStorageClient('my-project');
  const bucket = client.bucket('my-bucket');

  // ❌ Missing error handling after factory creation
  await bucket.upload('file.txt');
}
