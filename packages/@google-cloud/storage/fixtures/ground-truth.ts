import { Storage, TransferManager } from '@google-cloud/storage';
import { MultiPartUploadError } from '@google-cloud/storage';

const storage = new Storage();

// =============================================================================
// File.copy() test cases
// =============================================================================

// @expect-violation: copy-source-not-found
// @expect-violation: copy-permission-error
async function copyFileWithoutErrorHandling() {
  const sourceFile = storage.bucket('source-bucket').file('file.txt');
  await sourceFile.copy(storage.bucket('dest-bucket').file('file-copy.txt'));
}

// @expect-clean
async function copyFileWithErrorHandling() {
  try {
    const sourceFile = storage.bucket('source-bucket').file('file.txt');
    await sourceFile.copy(storage.bucket('dest-bucket').file('file-copy.txt'));
  } catch (error) {
    console.error('Copy failed:', error);
    throw error;
  }
}

// =============================================================================
// File.move() test cases
// =============================================================================

// @expect-violation: move-non-atomic-duplicate-risk
// @expect-violation: move-source-not-found
async function moveFileWithoutErrorHandling() {
  const file = storage.bucket('my-bucket').file('old-name.txt');
  await file.move('new-name.txt');
}

// @expect-clean
async function moveFileWithErrorHandling() {
  try {
    const file = storage.bucket('my-bucket').file('old-name.txt');
    await file.move('new-name.txt');
  } catch (error) {
    // NOTE: move() is not atomic — on error, check if destination was created
    // If error is 404 on delete phase, destination may have been successfully created
    console.error('Move failed:', error);
    throw error;
  }
}

// =============================================================================
// File.rename() test cases
// =============================================================================

// @expect-violation: rename-non-atomic-duplicate-risk
// @expect-violation: rename-not-found
async function renameFileWithoutErrorHandling() {
  const file = storage.bucket('my-bucket').file('old-name.txt');
  await file.rename('new-name.txt');
}

// @expect-clean
async function renameFileWithErrorHandling() {
  try {
    const file = storage.bucket('my-bucket').file('old-name.txt');
    await file.rename('new-name.txt');
  } catch (error) {
    console.error('Rename failed:', error);
    throw error;
  }
}

// =============================================================================
// TransferManager.uploadManyFiles() test cases
// =============================================================================

// @expect-violation: transfer-upload-many-all-or-nothing
// @expect-violation: transfer-upload-many-permission-error
async function uploadManyFilesWithoutErrorHandling() {
  const bucket = storage.bucket('my-bucket');
  const transferManager = new TransferManager(bucket);
  await transferManager.uploadManyFiles(['/local/file1.txt', '/local/file2.txt']);
}

// @expect-clean
async function uploadManyFilesWithErrorHandling() {
  try {
    const bucket = storage.bucket('my-bucket');
    const transferManager = new TransferManager(bucket);
    await transferManager.uploadManyFiles(['/local/file1.txt', '/local/file2.txt']);
  } catch (error) {
    // NOTE: Some files may have been uploaded before the error — check GCS for state
    console.error('Batch upload failed:', error);
    throw error;
  }
}

// =============================================================================
// TransferManager.downloadManyFiles() test cases
// =============================================================================

// @expect-violation: transfer-download-many-all-or-nothing
// @expect-violation: transfer-download-many-file-not-found
async function downloadManyFilesWithoutErrorHandling() {
  const bucket = storage.bucket('my-bucket');
  const transferManager = new TransferManager(bucket);
  await transferManager.downloadManyFiles(['file1.txt', 'file2.txt']);
}

// @expect-clean
async function downloadManyFilesWithErrorHandling() {
  try {
    const bucket = storage.bucket('my-bucket');
    const transferManager = new TransferManager(bucket);
    await transferManager.downloadManyFiles(['file1.txt', 'file2.txt']);
  } catch (error) {
    console.error('Batch download failed:', error);
    throw error;
  }
}

// =============================================================================
// TransferManager.downloadFileInChunks() test cases
// =============================================================================

// @expect-violation: transfer-download-chunks-crc32c-mismatch
// @expect-violation: transfer-download-chunks-file-not-found
// @expect-violation: transfer-download-chunks-partial-chunk-failure
async function downloadFileInChunksWithoutErrorHandling() {
  const bucket = storage.bucket('my-bucket');
  const transferManager = new TransferManager(bucket);
  await transferManager.downloadFileInChunks('large-file.bin', {
    validation: 'crc32c',
  });
}

// @expect-clean
async function downloadFileInChunksWithErrorHandling() {
  try {
    const bucket = storage.bucket('my-bucket');
    const transferManager = new TransferManager(bucket);
    await transferManager.downloadFileInChunks('large-file.bin', {
      validation: 'crc32c',
    });
  } catch (error: any) {
    if (error.code === 'CONTENT_DOWNLOAD_MISMATCH') {
      // Delete the corrupted local file and retry
      console.error('Download corrupted — CRC32C mismatch, retrying');
    }
    throw error;
  }
}

// =============================================================================
// TransferManager.uploadFileInChunks() test cases
// =============================================================================

// @expect-violation: transfer-upload-chunks-multipart-error
// @expect-violation: transfer-upload-chunks-permission-error
async function uploadFileInChunksWithoutErrorHandling() {
  const bucket = storage.bucket('my-bucket');
  const transferManager = new TransferManager(bucket);
  await transferManager.uploadFileInChunks('/local/large-file.bin');
}

// @expect-clean
async function uploadFileInChunksWithErrorHandling() {
  try {
    const bucket = storage.bucket('my-bucket');
    const transferManager = new TransferManager(bucket);
    await transferManager.uploadFileInChunks('/local/large-file.bin', {
      autoAbortFailure: false, // Keep uploadId for resume
    });
  } catch (error: any) {
    // MultiPartUploadError has uploadId and partsMap for resuming
    if (error.uploadId) {
      console.log('Upload failed, can resume with uploadId:', error.uploadId);
      console.log('Parts uploaded so far:', error.partsMap?.size ?? 0);
      // Store error.uploadId and error.partsMap to resume later
    }
    throw error;
  }
}

// =============================================================================
// Bucket.combine() test cases
// =============================================================================

// SHOULD_FIRE: combine-source-limit-exceeded
// SHOULD_FIRE: combine-source-not-found
// SHOULD_FIRE: combine-precondition-failed
async function combineFilesWithoutErrorHandling() {
  const bucket = storage.bucket('my-bucket');
  const sources = ['chunk-1.bin', 'chunk-2.bin', 'chunk-3.bin'];
  await bucket.combine(sources, 'assembled.bin');
}

// @expect-clean
async function combineFilesWithErrorHandling() {
  try {
    const bucket = storage.bucket('my-bucket');
    const sources = ['chunk-1.bin', 'chunk-2.bin', 'chunk-3.bin'];
    await bucket.combine(sources, 'assembled.bin');
  } catch (error: any) {
    if (error.code === 412) {
      // Precondition failed — concurrent writer changed the destination
      console.error('Compose conflict, re-read destination and retry');
    } else if (error.code === 404) {
      console.error('Source object missing, cannot assemble:', error.message);
    } else if (error.code === 400) {
      console.error('Compose rejected (likely > 32 sources):', error.message);
    }
    throw error;
  }
}

// =============================================================================
// File.moveFileAtomic() test cases
// =============================================================================

// SHOULD_FIRE: move-file-atomic-non-hns-bucket
// SHOULD_FIRE: move-file-atomic-precondition-failed
// SHOULD_FIRE: move-file-atomic-source-not-found
async function moveFileAtomicWithoutErrorHandling() {
  const file = storage.bucket('hns-bucket').file('source.txt');
  await file.moveFileAtomic('destination.txt');
}

// @expect-clean
async function moveFileAtomicWithErrorHandling() {
  try {
    const file = storage.bucket('hns-bucket').file('source.txt');
    await file.moveFileAtomic('destination.txt');
  } catch (error: any) {
    if (error.code === 400) {
      // Fall back to non-atomic move on flat buckets
      console.warn('Bucket is not HNS, falling back to non-atomic move');
      const file2 = storage.bucket('hns-bucket').file('source.txt');
      await file2.move('destination.txt');
    } else if (error.code === 412) {
      console.error('Precondition failed on atomic move, re-evaluate destination');
    } else {
      throw error;
    }
  }
}

// =============================================================================
// Bucket.lock() test cases
// =============================================================================

// SHOULD_FIRE: lock-precondition-failed
// SHOULD_FIRE: lock-no-retention-policy
// SHOULD_FIRE: lock-permission-error
async function lockRetentionWithoutErrorHandling() {
  const bucket = storage.bucket('compliance-bucket');
  const [metadata] = await bucket.getMetadata();
  await bucket.lock(metadata.metageneration!);
}

// @expect-clean
async function lockRetentionWithErrorHandling() {
  try {
    const bucket = storage.bucket('compliance-bucket');
    const [metadata] = await bucket.getMetadata();
    if (!metadata.retentionPolicy) {
      throw new Error('No retention policy set — refusing to lock empty policy');
    }
    await bucket.lock(metadata.metageneration!);
  } catch (error: any) {
    if (error.code === 412) {
      // Metadata changed between read and lock — re-read and retry
      console.error('Bucket metadata changed since read, refusing to lock stale state');
    } else if (error.code === 403) {
      console.error('Insufficient permissions to lock retention policy');
    } else if (error.code === 400) {
      console.error('Lock rejected (no retention policy or invalid request)');
    }
    throw error;
  }
}
