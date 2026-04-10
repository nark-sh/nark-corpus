import { put, del, list } from '@vercel/blob';

export async function uploadFileWithCatch(pathname: string, content: Buffer): Promise<string> {
  try {
    const blob = await put(pathname, content, { access: 'public' });
    return blob.url;
  } catch (err) {
    console.error('Blob upload failed:', err);
    throw err;
  }
}

export async function deleteFileWithCatch(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error('Blob deletion failed:', err);
    throw err;
  }
}

export async function listFilesWithCatch(prefix: string) {
  try {
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (err) {
    console.error('Blob list failed:', err);
    throw err;
  }
}
