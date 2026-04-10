import { Storage } from '@google-cloud/storage';

const storage = new Storage();

// ❌ Missing error handling - should trigger violation
async function uploadFile() {
  const bucket = storage.bucket('my-bucket');
  await bucket.upload('local-file.txt');
}

// ❌ Missing error handling - should trigger violation
async function downloadFile() {
  const file = storage.bucket('my-bucket').file('remote-file.txt');
  await file.download();
}

// ❌ Missing error handling - file.save()
async function saveFile() {
  const file = storage.bucket('my-bucket').file('data.txt');
  await file.save('Hello, World!');
}

// ❌ Missing error handling - storage.createBucket()
async function createBucket() {
  await storage.createBucket('new-bucket');
}

// ❌ Missing error handling - bucket.delete()
async function deleteBucket() {
  const bucket = storage.bucket('old-bucket');
  await bucket.delete();
}

// ❌ Missing error handling - file.delete()
async function deleteFile() {
  const file = storage.bucket('my-bucket').file('old-file.txt');
  await file.delete();
}

// ❌ Missing error handling - file.copy()
async function copyFile() {
  const file = storage.bucket('source-bucket').file('file.txt');
  await file.copy(storage.bucket('dest-bucket').file('file-copy.txt'));
}

// ❌ Missing error handling - file.getMetadata()
async function getFileMetadata() {
  const file = storage.bucket('my-bucket').file('file.txt');
  const [metadata] = await file.getMetadata();
  console.log(metadata);
}

// ❌ Missing error handling - file.setMetadata()
async function setFileMetadata() {
  const file = storage.bucket('my-bucket').file('file.txt');
  await file.setMetadata({ contentType: 'text/plain' });
}

// ❌ Missing error handling - bucket.getFiles()
async function listFiles() {
  const bucket = storage.bucket('my-bucket');
  const [files] = await bucket.getFiles();
  console.log(`Found ${files.length} files`);
}

// ❌ Missing error handling - storage.getBuckets()
async function listBuckets() {
  const [buckets] = await storage.getBuckets();
  console.log(`Found ${buckets.length} buckets`);
}

// ❌ Missing error handling - file.getSignedUrl()
async function getSignedUrl() {
  const file = storage.bucket('my-bucket').file('file.txt');
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000
  });
  console.log(url);
}

// ❌ Missing error handling - bucket.deleteFiles()
async function deleteAllFiles() {
  const bucket = storage.bucket('my-bucket');
  await bucket.deleteFiles();
}

// ❌ Missing error handling - storage.createHmacKey()
async function createHmacKey() {
  await storage.createHmacKey('service-account@example.iam.gserviceaccount.com');
}

// ❌ Missing error handling - bucket.getMetadata()
async function getBucketMetadata() {
  const bucket = storage.bucket('my-bucket');
  const [metadata] = await bucket.getMetadata();
  console.log(metadata);
}

// ❌ Missing error handling - bucket.setMetadata()
async function setBucketMetadata() {
  const bucket = storage.bucket('my-bucket');
  await bucket.setMetadata({ website: { mainPageSuffix: 'index.html' } });
}
