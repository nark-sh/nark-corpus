import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(bucket: string) {
    this.client = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });
    this.bucket = bucket;
  }

  // No try-catch
  async getFileUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return await getSignedUrl(this.client, command, { expiresIn: 3600 });
  }
}
