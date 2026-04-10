import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

class S3UploadService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });
  }

  async uploadDocument(bucket: string, key: string, content: Buffer) {
    const upload = new Upload({
      client: this.s3,
      params: { Bucket: bucket, Key: key, Body: content, ContentType: 'application/pdf' },
    });
    // No try-catch — should fire
    return await upload.done();
  }
}
