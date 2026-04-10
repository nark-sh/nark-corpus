import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloud_name: 'demo', api_key: 'key', api_secret: 'secret' });

// ❌ VIOLATION: upload-missing-error-handling
async function uploadWithoutTryCatch(file: string) {
  const result = await cloudinary.uploader.upload(file);
  return result;
}

// ❌ VIOLATION: upload-large-missing-error-handling
async function uploadLargeWithoutTryCatch(file: string) {
  const result = await cloudinary.uploader.upload_large(file, { chunk_size: 6000000 });
  return result;
}

// ❌ VIOLATION: upload-stream-missing-error-handling
function uploadStreamWithoutCallback(buffer: Buffer) {
  const stream = cloudinary.uploader.upload_stream();
  stream.end(buffer);
}

// ❌ VIOLATION: destroy-missing-error-handling
async function destroyWithoutTryCatch(publicId: string) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export { uploadWithoutTryCatch, uploadLargeWithoutTryCatch, uploadStreamWithoutCallback, destroyWithoutTryCatch };
