import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

/**
 * Proper: GetObject with error handling
 */
async function getObjectWithErrorHandling(bucket: string, key: string) {
  try {
    const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response.Body;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      console.error(`Object ${key} not found in bucket ${bucket}`);
    }
    throw error;
  }
}

/**
 * Proper: PutObject with error handling
 */
async function putObjectWithErrorHandling(bucket: string, key: string, body: Buffer) {
  try {
    await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
    console.log('Object uploaded successfully');
  } catch (error: any) {
    if (error.name === 'AccessDenied') {
      console.error('Insufficient permissions to upload object');
    }
    throw error;
  }
}

/**
 * Proper: DeleteObject with error handling
 */
async function deleteObjectWithErrorHandling(bucket: string, key: string) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error: any) {
    console.error('Failed to delete object:', error.message);
    throw error;
  }
}

/**
 * Proper: ListObjectsV2 with error handling
 */
async function listObjectsWithErrorHandling(bucket: string, prefix?: string) {
  try {
    const response = await s3Client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
    return response.Contents || [];
  } catch (error: any) {
    console.error('Failed to list objects:', error.message);
    throw error;
  }
}

/**
 * Proper: Multipart upload with error handling and cleanup
 */
async function multipartUploadWithErrorHandling(bucket: string, key: string, parts: Buffer[]) {
  let uploadId: string | undefined;
  
  try {
    const createResponse = await s3Client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key }));
    uploadId = createResponse.UploadId;

    const uploadPromises = parts.map((part, index) =>
      s3Client.send(new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: index + 1,
        Body: part
      }))
    );

    const uploadResults = await Promise.all(uploadPromises);
    
    await s3Client.send(new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: uploadResults.map((result, index) => ({
          ETag: result.ETag,
          PartNumber: index + 1
        }))
      }
    }));

    console.log('Multipart upload completed');
  } catch (error: any) {
    console.error('Multipart upload failed:', error.message);
    // Cleanup: abort multipart upload
    if (uploadId) {
      await s3Client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
    }
    throw error;
  }
}

/**
 * Proper: Nested operations with error handling
 */
async function copyObjectWithErrorHandling(sourceBucket: string, sourceKey: string, destBucket: string, destKey: string) {
  try {
    const getResponse = await s3Client.send(new GetObjectCommand({ Bucket: sourceBucket, Key: sourceKey }));
    const body = await getResponse.Body?.transformToByteArray();
    
    if (body) {
      await s3Client.send(new PutObjectCommand({ Bucket: destBucket, Key: destKey, Body: body }));
    }
  } catch (error: any) {
    console.error('Copy operation failed:', error.message);
    throw error;
  }
}
