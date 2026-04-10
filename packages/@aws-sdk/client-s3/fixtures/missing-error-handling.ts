import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand, ListObjectsV2Command, ListBucketsCommand, CreateBucketCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

/**
 * VIOLATION: GetObject without error handling
 */
async function getObjectMissingErrorHandling(bucket: string, key: string) {
  const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return response.Body;
}

/**
 * VIOLATION: PutObject without error handling
 */
async function putObjectMissingErrorHandling(bucket: string, key: string, body: Buffer) {
  await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
  console.log('Object uploaded');
}

/**
 * VIOLATION: DeleteObject without error handling
 */
async function deleteObjectMissingErrorHandling(bucket: string, key: string) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * VIOLATION: HeadObject without error handling
 */
async function headObjectMissingErrorHandling(bucket: string, key: string) {
  const response = await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  return response.Metadata;
}

/**
 * VIOLATION: CopyObject without error handling
 */
async function copyObjectMissingErrorHandling(sourceBucket: string, sourceKey: string, destBucket: string, destKey: string) {
  await s3Client.send(new CopyObjectCommand({
    Bucket: destBucket,
    Key: destKey,
    CopySource: `${sourceBucket}/${sourceKey}`
  }));
}

/**
 * VIOLATION: CreateBucket without error handling
 */
async function createBucketMissingErrorHandling(bucketName: string) {
  await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
}

/**
 * VIOLATION: ListObjectsV2 without error handling (WARNING level)
 */
async function listObjectsMissingErrorHandling(bucket: string) {
  const response = await s3Client.send(new ListObjectsV2Command({ Bucket: bucket }));
  return response.Contents || [];
}

/**
 * VIOLATION: ListBuckets without error handling (WARNING level)
 */
async function listBucketsMissingErrorHandling() {
  const response = await s3Client.send(new ListBucketsCommand({}));
  return response.Buckets || [];
}

/**
 * VIOLATION: Multipart upload without error handling
 */
async function multipartUploadMissingErrorHandling(bucket: string, key: string, parts: Buffer[]) {
  const createResponse = await s3Client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key }));
  const uploadId = createResponse.UploadId\!;

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
}
