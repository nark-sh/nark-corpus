import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * Pattern 1: Class with S3Client instance - proper error handling
 */
class S3ServiceProper {
  private client: S3Client;

  constructor(region: string) {
    this.client = new S3Client({ region });
  }

  async getObject(bucket: string, key: string) {
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      return response.Body;
    } catch (error: any) {
      console.error('Failed to get object:', error.message);
      throw error;
    }
  }

  async putObject(bucket: string, key: string, body: Buffer) {
    try {
      await this.client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
    } catch (error: any) {
      console.error('Failed to put object:', error.message);
      throw error;
    }
  }
}

/**
 * Pattern 2: Class with S3Client instance - MISSING error handling
 */
class S3ServiceMissing {
  private client: S3Client;

  constructor(region: string) {
    this.client = new S3Client({ region });
  }

  async getObject(bucket: string, key: string) {
    // VIOLATION: No try-catch
    const response = await this.client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response.Body;
  }

  async putObject(bucket: string, key: string, body: Buffer) {
    // VIOLATION: No try-catch
    await this.client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
  }

  async listObjects(bucket: string) {
    // VIOLATION: No try-catch (WARNING level)
    const response = await this.client.send(new ListObjectsV2Command({ Bucket: bucket }));
    return response.Contents || [];
  }
}

/**
 * Pattern 3: Repository pattern with dependency injection
 */
class S3Repository {
  constructor(private s3Client: S3Client) {}

  async uploadFile(bucket: string, key: string, content: Buffer) {
    // VIOLATION: No try-catch
    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content
    }));
  }

  async downloadFile(bucket: string, key: string) {
    // VIOLATION: No try-catch
    const response = await this.s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key
    }));
    return response.Body;
  }
}

// Usage example
const repository = new S3Repository(new S3Client({ region: 'us-west-2' }));
