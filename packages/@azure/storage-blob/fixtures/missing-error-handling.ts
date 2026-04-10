import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=...';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Missing error handling - should trigger violation
async function uploadBlob() {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  await containerClient.uploadBlockBlob('myblob', 'Hello World', 11);
}

// Missing error handling - should trigger violation
async function downloadBlob() {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  const blobClient = containerClient.getBlockBlobClient('myblob');
  await blobClient.download();
}
