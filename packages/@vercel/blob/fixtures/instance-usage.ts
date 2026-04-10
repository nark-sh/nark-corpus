import { put, del } from '@vercel/blob';

class BlobStorageService {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  // No try-catch — violation expected
  async uploadFile(key: string, content: Buffer): Promise<string> {
    const blob = await put(`${this.bucket}/${key}`, content, { access: 'public' });
    return blob.url;
  }

  // No try-catch — violation expected
  async deleteFile(url: string): Promise<void> {
    await del(url);
  }
}
