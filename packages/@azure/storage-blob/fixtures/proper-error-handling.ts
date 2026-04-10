import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=...';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Proper error handling
async function uploadBlob() {
  try {
    const containerClient = blobServiceClient.getContainerClient('mycontainer');
    await containerClient.uploadBlockBlob('myblob', 'Hello World', 11);
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Proper error handling
async function downloadBlob() {
  try {
    const containerClient = blobServiceClient.getContainerClient('mycontainer');
    const blobClient = containerClient.getBlockBlobClient('myblob');
    await blobClient.download();
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
