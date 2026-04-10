import { BlobServiceClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob';

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=...';

// Test instance-based detection

class BlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient('mycontainer');
  }

  // ❌ Missing error handling on instance method
  async uploadFile(blobName: string, content: string) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, content.length);
  }

  // ❌ Missing error handling on instance method  
  async downloadFile(blobName: string) {
    const blobClient = this.containerClient.getBlobClient(blobName);
    const response = await blobClient.download();
    return response;
  }

  // ✅ Proper error handling on instance method
  async deleteFile(blobName: string) {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      await blobClient.delete();
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  // ❌ Missing error handling on container operations
  async ensureContainerExists() {
    const exists = await this.containerClient.exists();
    if (\!exists) {
      await this.containerClient.create();
    }
  }
}
