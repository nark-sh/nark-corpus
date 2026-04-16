/**
 * Ground-truth test fixtures for @azure/storage-blob
 * Tests for functions added in depth pass (2026-04-16):
 *   deleteBlob (BlobClient), uploadStream (BlockBlobClient),
 *   uploadBlockBlob (ContainerClient), deleteBlob (ContainerClient),
 *   beginCopyFromURL, syncCopyFromURL, downloadToBuffer,
 *   downloadToFile, getUserDelegationKey, generateSasUrl (ContainerClient)
 */

import { BlobServiceClient, BlobClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob';
import { Readable } from 'stream';

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=key;EndpointSuffix=core.windows.net';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient('mycontainer');
const blobClient: BlobClient = containerClient.getBlobClient('myblob');
const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient('myblob');

// ─────────────────────────────────────────────────────────────────────────────
// BlobClient.delete() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: blob-delete-snapshots-present
// @expect-violation: blob-delete-not-found
// @expect-violation: blob-delete-lease-conflict
async function deleteBlobMissingErrorHandling(blobClient: BlobClient) {
  await blobClient.delete();
}

// @expect-clean
async function deleteBlobWithErrorHandling(blobClient: BlobClient) {
  try {
    await blobClient.delete({ deleteSnapshots: 'include' });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      // Blob already deleted — treat as success
      return;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BlockBlobClient.uploadStream() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: uploadstream-no-try-catch
// @expect-violation: uploadstream-container-not-found
async function uploadStreamMissingErrorHandling(blockBlobClient: BlockBlobClient, stream: Readable) {
  await blockBlobClient.uploadStream(stream);
}

// @expect-clean
async function uploadStreamWithErrorHandling(blockBlobClient: BlockBlobClient, stream: Readable) {
  try {
    await blockBlobClient.uploadStream(stream, 8 * 1024 * 1024, 5);
  } catch (error: any) {
    if (error?.statusCode === 404 && error?.details?.errorCode === 'ContainerNotFound') {
      throw new Error('Container does not exist — provision it first');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ContainerClient.uploadBlockBlob() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: uploadblockblob-no-try-catch
// @expect-violation: uploadblockblob-container-not-found
async function uploadBlockBlobMissingErrorHandling(containerClient: ContainerClient) {
  await containerClient.uploadBlockBlob('myblob', 'Hello World', 11);
}

// @expect-clean
async function uploadBlockBlobWithErrorHandling(containerClient: ContainerClient) {
  try {
    const { blockBlobClient } = await containerClient.uploadBlockBlob('myblob', 'Hello World', 11);
    return blockBlobClient;
  } catch (error: any) {
    if (error?.statusCode === 404) {
      await containerClient.createIfNotExists();
      const { blockBlobClient } = await containerClient.uploadBlockBlob('myblob', 'Hello World', 11);
      return blockBlobClient;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ContainerClient.deleteBlob() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: container-deleteblob-snapshots-present
// @expect-violation: container-deleteblob-not-found
async function deleteBlobViaContainerMissingErrorHandling(containerClient: ContainerClient) {
  await containerClient.deleteBlob('myblob');
}

// @expect-clean
async function deleteBlobViaContainerWithErrorHandling(containerClient: ContainerClient) {
  try {
    await containerClient.deleteBlob('myblob', { deleteSnapshots: 'include' });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      // Already deleted
      return;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BlobClient.beginCopyFromURL() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: begincopy-poll-not-awaited
// @expect-violation: begincopy-source-not-accessible
async function beginCopyMissingPollAndErrorHandling(blobClient: BlobClient) {
  await blobClient.beginCopyFromURL('https://source.blob.core.windows.net/container/blob');
  // Violation: not awaiting pollUntilDone() — copy may not be complete
}

// @expect-clean
async function beginCopyWithProperHandling(blobClient: BlobClient) {
  try {
    const poller = await blobClient.beginCopyFromURL('https://source.blob.core.windows.net/container/blob?sas=...');
    const result = await poller.pollUntilDone();
    if (result.copyStatus !== 'success') {
      throw new Error(`Copy failed with status: ${result.copyStatus}`);
    }
  } catch (error: any) {
    if (error?.statusCode === 403) {
      throw new Error('Source blob inaccessible — check SAS token permissions');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BlobClient.syncCopyFromURL() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: synccopy-no-try-catch
// @expect-violation: synccopy-source-inaccessible
async function syncCopyMissingErrorHandling(blobClient: BlobClient) {
  await blobClient.syncCopyFromURL('https://source.blob.core.windows.net/container/blob');
}

// @expect-clean
async function syncCopyWithErrorHandling(blobClient: BlobClient) {
  try {
    await blobClient.syncCopyFromURL('https://source.blob.core.windows.net/container/blob?sas=...');
  } catch (error: any) {
    if (error?.statusCode === 403) {
      throw new Error('Source URL requires SAS token or is inaccessible to storage service');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BlobClient.downloadToBuffer() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: downloadtobuffer-no-try-catch
// @expect-violation: downloadtobuffer-blob-not-found
async function downloadToBufferMissingErrorHandling(blobClient: BlobClient) {
  const buffer = await blobClient.downloadToBuffer();
  return buffer;
}

// @expect-clean
async function downloadToBufferWithErrorHandling(blobClient: BlobClient) {
  try {
    return await blobClient.downloadToBuffer(0, undefined, { concurrency: 5 });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      throw new Error(`Blob not found: ${blobClient.url}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BlobClient.downloadToFile() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: downloadtofile-no-try-catch
// @expect-violation: downloadtofile-blob-not-found
async function downloadToFileMissingErrorHandling(blobClient: BlobClient) {
  await blobClient.downloadToFile('/tmp/output.bin');
}

// @expect-clean
async function downloadToFileWithErrorHandling(blobClient: BlobClient, filePath: string) {
  try {
    await blobClient.downloadToFile(filePath);
  } catch (error: any) {
    // Clean up partial file on error
    const fs = await import('fs/promises');
    await fs.unlink(filePath).catch(() => {});
    if (error?.statusCode === 404) {
      throw new Error(`Blob not found: ${blobClient.url}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BlobServiceClient.getUserDelegationKey() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: getuserdelegationkey-no-try-catch
// @expect-violation: getuserdelegationkey-expired-window
async function getUserDelegationKeyMissingErrorHandling(blobServiceClient: BlobServiceClient) {
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + 60 * 60 * 1000); // 1 hour
  const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
  return userDelegationKey;
}

// @expect-clean
async function getUserDelegationKeyWithErrorHandling(blobServiceClient: BlobServiceClient) {
  try {
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 55 * 60 * 1000); // 55 min (refresh 5min early)
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
    // Schedule refresh before expiry
    const refreshMs = expiresOn.getTime() - Date.now() - 5 * 60 * 1000;
    setTimeout(() => { /* refresh logic */ }, Math.max(0, refreshMs));
    return { key: userDelegationKey, expiresOn };
  } catch (error: any) {
    if (error?.statusCode === 403) {
      throw new Error('Insufficient permissions to generate user delegation key — requires Storage Blob Delegator role');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ContainerClient.generateSasUrl() — VIOLATION cases
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: generatesasurl-not-shared-key
// @expect-violation: generatesasurl-expired-sas
async function generateSasUrlMissingErrorHandling(containerClient: ContainerClient) {
  const expiresOn = new Date(Date.now() + 3600 * 1000);
  const sasUrl = await containerClient.generateSasUrl({
    expiresOn,
    permissions: { read: true } as any,
  });
  return sasUrl;
}

// @expect-clean
async function generateSasUrlWithErrorHandling(containerClient: ContainerClient) {
  try {
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    return await containerClient.generateSasUrl({
      expiresOn,
      permissions: { read: true, write: true } as any,
    });
  } catch (error: any) {
    if (error?.message?.includes('shared key credential')) {
      throw new Error('Cannot generate SAS URL — use StorageSharedKeyCredential or getUserDelegationKey() with generateUserDelegationSasUrl()');
    }
    throw error;
  }
}
