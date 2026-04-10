import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({ region: 'us-east-1' });

export async function uploadFileWithCatch(bucket: string, key: string, body: Readable) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: bucket, Key: key, Body: body },
  });
  try {
    await upload.done();
    console.log('Upload complete');
  } catch (err) {
    console.error('Upload failed:', err);
    await upload.abort();
    throw err;
  }
}
