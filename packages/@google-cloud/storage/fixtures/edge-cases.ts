import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';

const storage = new Storage();

/**
 * Edge cases for @google-cloud/storage error handling
 */

// ================================
// STREAM OPERATIONS
// ================================

// ❌ createReadStream without error handler
// Note: Streams emit 'error' events, not throw exceptions
// Current analyzer may not detect missing event handlers
async function downloadViaStreamNoErrorHandler() {
  const file = storage.bucket('my-bucket').file('file.txt');
  const readStream = file.createReadStream();

  // Missing .on('error', handler)
  readStream.pipe(fs.createWriteStream('output.txt'));
}

// ✅ createReadStream with error handler
async function downloadViaStreamWithErrorHandler() {
  const file = storage.bucket('my-bucket').file('file.txt');
  const readStream = file.createReadStream();

  readStream.on('error', (error) => {
    console.error('Stream error:', error);
  });

  readStream.pipe(fs.createWriteStream('output.txt'));
}

// ❌ createWriteStream without error handler
async function uploadViaStreamNoErrorHandler() {
  const file = storage.bucket('my-bucket').file('uploaded.txt');
  const writeStream = file.createWriteStream();

  // Missing .on('error', handler)
  fs.createReadStream('input.txt').pipe(writeStream);
}

// ✅ createWriteStream with error handler
async function uploadViaStreamWithErrorHandler() {
  const file = storage.bucket('my-bucket').file('uploaded.txt');
  const writeStream = file.createWriteStream();

  writeStream.on('error', (error) => {
    console.error('Upload stream error:', error);
  });

  writeStream.on('finish', () => {
    console.log('Upload complete');
  });

  fs.createReadStream('input.txt').pipe(writeStream);
}

// ================================
// PROMISE CHAINS
// ================================

// ❌ Promise chain without catch
async function promiseChainNoCatch() {
  storage.bucket('my-bucket')
    .file('file.txt')
    .download()
    .then(data => console.log('Downloaded:', data[0].length));
  // Missing .catch()
}

// ✅ Promise chain with catch
async function promiseChainWithCatch() {
  storage.bucket('my-bucket')
    .file('file.txt')
    .download()
    .then(data => console.log('Downloaded:', data[0].length))
    .catch(error => console.error('Download failed:', error));
}

// ================================
// CHAINED OPERATIONS
// ================================

// ❌ Chained method calls without error handling
async function chainedWithoutTryCatch() {
  const [files] = await storage
    .bucket('my-bucket')
    .getFiles({ prefix: 'uploads/' });

  console.log(`Found ${files.length} files`);
}

// ✅ Chained method calls with error handling
async function chainedWithTryCatch() {
  try {
    const [files] = await storage
      .bucket('my-bucket')
      .getFiles({ prefix: 'uploads/' });

    console.log(`Found ${files.length} files`);
  } catch (error) {
    console.error('Failed to list files:', error);
    throw error;
  }
}

// ================================
// BATCH OPERATIONS (PartialFailureError)
// ================================

// ❌ Batch operation without error handling
async function batchDeleteNoCatch() {
  const bucket = storage.bucket('my-bucket');
  // May throw PartialFailureError if some deletions fail
  await bucket.deleteFiles({ prefix: 'temp/' });
}

// ✅ Batch operation with error handling
async function batchDeleteWithCatch() {
  try {
    const bucket = storage.bucket('my-bucket');
    await bucket.deleteFiles({ prefix: 'temp/' });
  } catch (error) {
    // Could be PartialFailureError
    console.error('Batch delete failed:', error);
    throw error;
  }
}

// ================================
// CALLBACK-STYLE (legacy, but still supported)
// ================================

// ❌ Callback without error handling (if callback throws)
function uploadWithCallbackNoErrorHandling() {
  const bucket = storage.bucket('my-bucket');

  bucket.upload('file.txt', (err, file, apiResponse) => {
    if (err) {
      // This is inside callback - won't be caught by outer try-catch
      throw err; // Unhandled!
    }
    console.log('Uploaded:', file.name);
  });
}

// ✅ Callback with proper error handling
function uploadWithCallbackProperHandling() {
  const bucket = storage.bucket('my-bucket');

  bucket.upload('file.txt', (err, file, apiResponse) => {
    if (err) {
      console.error('Upload failed:', err);
      return; // Don't throw in callback
    }
    console.log('Uploaded:', file.name);
  });
}

// ================================
// COMPLEX CHAINING
// ================================

// ❌ Multiple operations in sequence without try-catch
async function sequentialOperationsNoCatch() {
  const bucket = storage.bucket('my-bucket');

  // First operation
  await bucket.upload('file1.txt');

  // Second operation
  await bucket.file('file1.txt').getMetadata();

  // Third operation
  await bucket.file('file1.txt').delete();
}

// ✅ Multiple operations with error handling
async function sequentialOperationsWithCatch() {
  try {
    const bucket = storage.bucket('my-bucket');

    await bucket.upload('file1.txt');
    await bucket.file('file1.txt').getMetadata();
    await bucket.file('file1.txt').delete();
  } catch (error) {
    console.error('Sequential operations failed:', error);
    throw error;
  }
}

// ================================
// RETRY CONFIGURATION TESTING
// ================================

// ❌ Custom retry config but missing error handling
async function uploadWithRetryConfigNoCatch() {
  const storageWithRetry = new Storage({
    retryOptions: {
      autoRetry: true,
      maxRetries: 5,
      retryDelayMultiplier: 2
    }
  });

  // Even with retry, can still fail after max retries
  const bucket = storageWithRetry.bucket('my-bucket');
  await bucket.upload('file.txt');
}

// ✅ Custom retry config with error handling
async function uploadWithRetryConfigWithCatch() {
  try {
    const storageWithRetry = new Storage({
      retryOptions: {
        autoRetry: true,
        maxRetries: 5,
        retryDelayMultiplier: 2
      }
    });

    const bucket = storageWithRetry.bucket('my-bucket');
    await bucket.upload('file.txt');
  } catch (error) {
    console.error('Upload failed after retries:', error);
    throw error;
  }
}
