import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({ region: 'us-east-1' });

// No try-catch around upload.done()
export async function uploadFileMissing(bucket: string, key: string, body: Readable) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: body },
  });
  await upload.done(); // Should fire violation
}
