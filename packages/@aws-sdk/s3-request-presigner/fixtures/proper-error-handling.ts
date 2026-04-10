import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

export async function getDownloadUrl(bucket: string, key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error('Failed to generate presigned URL:', err);
    throw err;
  }
}

export async function getUploadUrl(bucket: string, key: string): Promise<string> {
  try {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  } catch (err) {
    console.error('Failed to generate upload URL:', err);
    throw err;
  }
}

export async function createUploadForm(bucket: string, key: string) {
  try {
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: key,
      Conditions: [['content-length-range', 0, 10485760]],
      Expires: 600,
    });
    return presignedPost;
  } catch (err) {
    console.error('Failed to create presigned POST:', err);
    throw err;
  }
}
