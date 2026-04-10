import { Storage } from '@google-cloud/storage';

const storage = new Storage();

// ✅ Proper error handling - bucket.upload()
async function uploadFile() {
  try {
    const bucket = storage.bucket('my-bucket');
    await bucket.upload('local-file.txt');
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.download()
async function downloadFile() {
  try {
    const file = storage.bucket('my-bucket').file('remote-file.txt');
    await file.download();
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.save()
async function saveFile() {
  try {
    const file = storage.bucket('my-bucket').file('data.txt');
    await file.save('Hello, World!');
  } catch (error) {
    console.error('Save failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - storage.createBucket()
async function createBucket() {
  try {
    await storage.createBucket('new-bucket');
  } catch (error) {
    console.error('Create bucket failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - bucket.delete()
async function deleteBucket() {
  try {
    const bucket = storage.bucket('old-bucket');
    await bucket.delete();
  } catch (error) {
    console.error('Delete bucket failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.delete()
async function deleteFile() {
  try {
    const file = storage.bucket('my-bucket').file('old-file.txt');
    await file.delete();
  } catch (error) {
    console.error('Delete file failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.copy()
async function copyFile() {
  try {
    const file = storage.bucket('source-bucket').file('file.txt');
    await file.copy(storage.bucket('dest-bucket').file('file-copy.txt'));
  } catch (error) {
    console.error('Copy failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.getMetadata()
async function getFileMetadata() {
  try {
    const file = storage.bucket('my-bucket').file('file.txt');
    const [metadata] = await file.getMetadata();
    console.log(metadata);
  } catch (error) {
    console.error('Get metadata failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.setMetadata()
async function setFileMetadata() {
  try {
    const file = storage.bucket('my-bucket').file('file.txt');
    await file.setMetadata({ contentType: 'text/plain' });
  } catch (error) {
    console.error('Set metadata failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - bucket.getFiles()
async function listFiles() {
  try {
    const bucket = storage.bucket('my-bucket');
    const [files] = await bucket.getFiles();
    console.log(`Found ${files.length} files`);
  } catch (error) {
    console.error('List files failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - storage.getBuckets()
async function listBuckets() {
  try {
    const [buckets] = await storage.getBuckets();
    console.log(`Found ${buckets.length} buckets`);
  } catch (error) {
    console.error('List buckets failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - file.getSignedUrl()
async function getSignedUrl() {
  try {
    const file = storage.bucket('my-bucket').file('file.txt');
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000
    });
    console.log(url);
  } catch (error) {
    console.error('Get signed URL failed:', error);
    throw error;
  }
}

// ✅ Proper error handling - bucket.deleteFiles() (batch operation)
async function deleteAllFiles() {
  try {
    const bucket = storage.bucket('my-bucket');
    await bucket.deleteFiles();
  } catch (error) {
    // May be PartialFailureError if some deletions fail
    console.error('Delete all files failed:', error);
    throw error;
  }
}
