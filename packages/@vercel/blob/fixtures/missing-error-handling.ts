import { put, del, list } from '@vercel/blob';

// No try-catch — violations expected
export async function uploadFileMissing(pathname: string, content: Buffer): Promise<string> {
  const blob = await put(pathname, content, { access: 'public' });
  return blob.url;
}

export async function deleteFileMissing(url: string): Promise<void> {
  await del(url);
}

export async function listFilesMissing(prefix: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}
