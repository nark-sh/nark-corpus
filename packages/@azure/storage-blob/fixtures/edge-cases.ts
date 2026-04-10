import { BlobServiceClient, RestError } from '@azure/storage-blob';

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=...';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Edge case 1: Nested async calls
async function nestedOperations() {
  const containerClient = blobServiceClient.getContainerClient('container1');
  
  // ❌ Outer try-catch but inner calls not wrapped individually
  try {
    const blobClient1 = containerClient.getBlobClient('blob1');
    await blobClient1.download(); // May throw
    
    const blobClient2 = containerClient.getBlobClient('blob2');
    await blobClient2.download(); // May throw
    
    // This should still be detected as missing error handling on individual calls
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

// Edge case 2: Chained method calls
async function chainedCalls() {
  // ❌ No error handling on chained calls
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  const blobClient = containerClient.getBlockBlobClient('myblob');
  await blobClient.upload('data', 4);
}

// Edge case 3: Promise chains
function promiseChain() {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  
  // ❌ No error handling on promise chain
  return containerClient
    .getBlobClient('myblob')
    .download()
    .then(response => {
      console.log('Downloaded');
      return response;
    });
}

// Edge case 4: Error handling with specific error code checking
async function specificErrorHandling() {
  try {
    const containerClient = blobServiceClient.getContainerClient('mycontainer');
    await containerClient.create();
  } catch (error) {
    // ✅ Proper error handling with RestError instance check
    if (error instanceof RestError) {
      if (error.statusCode === 409) {
        console.log('Container already exists, continuing...');
        return;
      }
      const errorCode = error.response?.headers?.get('x-ms-error-code');
      console.error(`Error: ${errorCode}`);
    }
    throw error;
  }
}

// Edge case 5: Async IIFE
(async function() {
  // ❌ No error handling in async IIFE
  const containerClient = blobServiceClient.getContainerClient('temp');
  await containerClient.create();
})();

// Edge case 6: Callback-style error handling (anti-pattern)
async function callbackStyle() {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  
  // ❌ Using callback pattern for async/await (incorrect)
  containerClient.exists().then(
    (exists) => {
      console.log('Exists:', exists);
    },
    (error) => {
      // This is not proper try-catch
      console.error('Error:', error);
    }
  );
}

// Edge case 7: Parallel operations
async function parallelOperations() {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  
  // ❌ No error handling on Promise.all
  await Promise.all([
    containerClient.getBlobClient('blob1').download(),
    containerClient.getBlobClient('blob2').download(),
    containerClient.getBlobClient('blob3').download()
  ]);
}

// Edge case 8: Proper parallel operations
async function properParallelOperations() {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  
  // ✅ Proper error handling on parallel operations
  try {
    const results = await Promise.all([
      containerClient.getBlobClient('blob1').download(),
      containerClient.getBlobClient('blob2').download(),
      containerClient.getBlobClient('blob3').download()
    ]);
    return results;
  } catch (error) {
    console.error('Parallel download failed:', error);
    throw error;
  }
}
