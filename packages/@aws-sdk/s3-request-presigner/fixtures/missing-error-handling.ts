import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

// No try-catch — credential failures will crash
export async function getDownloadUrlMissing(bucket: string, key: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

export async function getUploadUrlMissing(bucket: string, key: string) {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return url;
}

export async function createUploadFormMissing(bucket: string, key: string) {
  const presignedPost = await createPresignedPost(s3Client, {
    Bucket: bucket,
    Key: key,
    Expires: 600,
  });
  return presignedPost;
}
