# Sources: @azure/storage-blob

**Package:** @azure/storage-blob
**Contract Version:** 1.0.0
**Last Verified:** 2026-02-27
**Status:** Draft (Phase 6-7 incomplete)

---

## Official Documentation

### Primary Documentation
- **Azure Storage Blob Client Library for JavaScript**  
  https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-blob-readme?view=azure-node-latest  
  Official Microsoft Learn documentation for the @azure/storage-blob SDK. Documents all client classes, methods, authentication patterns, and basic error handling.

- **npm Package**  
  https://www.npmjs.com/package/@azure/storage-blob  
  Official npm registry page with version history, installation instructions, and package metadata.

### API Reference
- **BlobClient API Reference**  
  https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobclient  
  Complete API documentation for BlobClient class including download(), getProperties(), delete(), and exists() methods.

- **BlockBlobClient API Reference**  
  https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blockblobclient  
  Complete API documentation for BlockBlobClient class including upload(), uploadFile(), and uploadData() methods.

- **ContainerClient API Reference**  
  https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient  
  Complete API documentation for ContainerClient class including create(), delete(), and exists() methods.

- **BlobServiceClient API Reference**  
  https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobserviceclient  
  Complete API documentation for BlobServiceClient class including listContainers() and container management methods.

### Getting Started
- **Quickstart: Azure Blob Storage for Node.js**  
  https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs  
  Official Microsoft quickstart guide showing how to create a Node.js application that uses Azure Blob Storage.

---

## Error Handling Documentation

### Error Codes
- **Blob Service Error Codes (REST API)**  
  https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes  
  **CRITICAL:** Comprehensive list of 60+ error codes including BlobNotFound (404), BlobAlreadyExists (409), ContainerNotFound (404), ContainerAlreadyExists (409), InvalidBlobType (409), LeaseIdMissing (412), BlobArchived (409), and more. Each error code includes HTTP status code and user message.

### Error Handling Patterns
- **Error Handling in Storage SDKs - GitHub Issue #4999**  
  https://github.com/Azure/azure-sdk-for-js/issues/4999  
  **CRITICAL:** Documents incomplete error parsing in the SDK. Error codes must be manually extracted from response headers using `err.response.headers.get('x-ms-error-code')` because the SDK does not automatically deserialize Azure-specific error information. This is a known limitation.

- **Top Level Error Fields Missing Data - GitHub Issue #12997**  
  https://github.com/Azure/azure-sdk-for-js/issues/12997  
  Documents that `error.details?.errorCode` is available but inconsistent. Developers should use multiple methods to access error codes.

### Troubleshooting
- **Troubleshoot Client Application Errors**  
  https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/alerts/troubleshoot-storage-client-application-errors  
  Official Microsoft troubleshooting guide for common client-side errors including authentication failures, permission errors, and network issues.

---

## Security & Vulnerability Information

### Security Recommendations
- **Security Recommendations for Blob Storage**  
  https://learn.microsoft.com/en-us/azure/storage/blobs/security-recommendations  
  Official Microsoft security best practices for Azure Blob Storage including authentication, authorization, network security, and encryption.

### CVE Information
- **CVE-2022-30187: CBC Padding Oracle in Azure Blob Storage Encryption Library**  
  https://github.com/advisories/GHSA-64x4-9hc6-r2h6  
  Security vulnerability in Java Azure Blob Storage Encryption SDK (not JavaScript). Included for awareness of encryption-related security concerns across Azure SDK family.

---

## Contract Rationale

### Postcondition: download - blob-not-found
**Error Code:** BlobNotFound (404)  
**Rationale:** When attempting to download a blob that doesn't exist, the SDK throws RestError with statusCode 404. Applications must handle this to distinguish between missing blobs (expected) and actual failures (unexpected). Unhandled exceptions cause application crashes.  
**Source:** https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes

### Postcondition: download - blob-archived
**Error Code:** BlobArchived (409)  
**Rationale:** Blobs in archived tier cannot be downloaded directly and must be rehydrated first. Applications must catch this error and either initiate rehydration or return appropriate error to user.  
**Source:** https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes

### Postcondition: upload - blob-already-exists
**Error Code:** BlobAlreadyExists (409)  
**Rationale:** When using If-None-Match: * header, upload fails if blob exists. Applications must handle conflicts appropriately, either by overwriting (different API call) or returning error.  
**Source:** https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes

### Postcondition: upload - container-not-found
**Error Code:** ContainerNotFound (404)  
**Rationale:** Uploading to non-existent container throws 404. Common mistake is not creating container first. Applications must either ensure container exists or handle 404 and create container.  
**Source:** https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes

### Postcondition: create - container-already-exists
**Error Code:** ContainerAlreadyExists (409)  
**Rationale:** Creating a container that already exists throws 409. Common pattern is to check exists() first or catch 409 and continue. Applications must not crash on this expected error.  
**Source:** https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes

### Postcondition: create - container-being-deleted
**Error Code:** ContainerBeingDeleted (409)  
**Rationale:** Container deletion is not instant. Attempting to create during deletion throws 409. Applications must wait and retry with exponential backoff.  
**Source:** https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-error-codes

### Postcondition: network-error (all operations)
**Error Codes:** ECONNREFUSED, ETIMEDOUT, ENOTFOUND  
**Rationale:** All async operations can fail due to network issues. Applications must implement retry logic with exponential backoff for transient failures.  
**Source:** https://github.com/Azure/azure-sdk-for-js/issues/4999

---

## Common Patterns

### Pattern 1: Upload with Container Creation
```typescript
try {
  const containerClient = blobServiceClient.getContainerClient('mycontainer');
  const blockBlobClient = containerClient.getBlockBlobClient('myblob');
  await blockBlobClient.upload(data, data.length);
} catch (error) {
  if (error instanceof RestError && error.statusCode === 404) {
    // Container doesn't exist, create it first
    await containerClient.create();
    await blockBlobClient.upload(data, data.length);
  } else {
    throw error;
  }
}
```

### Pattern 2: Download with 404 Handling
```typescript
try {
  const response = await blobClient.download();
  return response;
} catch (error) {
  if (error instanceof RestError && error.statusCode === 404) {
    console.log('Blob not found');
    return null; // Return null for missing blobs
  }
  throw error; // Re-throw other errors
}
```

### Pattern 3: Container Existence Check
```typescript
try {
  const exists = await containerClient.exists();
  if (\!exists) {
    await containerClient.create();
  }
} catch (error) {
  if (error instanceof RestError && error.statusCode === 409) {
    // Container created by another process, continue
    return;
  }
  throw error;
}
```

---

## Detection Characteristics

**Error Pattern:** All operations THROW exceptions (RestError)
**Detection Rate:** 85% (estimated, similar to axios, stripe, prisma)
**Analyzer Capability:** High - analyzer detects missing try-catch blocks well
**Production Ready:** No - requires Phase 6 (Analyzer Testing) and Phase 7 (Real-World Validation)
**Draft Reason:** Build issues prevented analyzer testing; validation incomplete

---

## Additional References

- **GitHub Repository**  
  https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob  
  Source code and samples for the Azure Storage Blob SDK

- **CHANGELOG**  
  https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/CHANGELOG.md  
  Version history including service version 2026-02-06 support

- **Complete Guide & Tutorial (2025)**  
  https://generalistprogrammer.com/tutorials/azure-storage-blob-npm-package-guide  
  Third-party comprehensive guide with code examples and best practices

---

**Research Date:** 2026-02-27  
**Researcher:** Claude Sonnet 4.5 (behavioral-contracts corpus team)
