import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloud_name: 'demo', api_key: 'key', api_secret: 'secret' });

// ✅ CORRECT: upload with try-catch
async function uploadWithTryCatch(file: string) {
  try {
    const result = await cloudinary.uploader.upload(file);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// ✅ CORRECT: upload_large with try-catch
async function uploadLargeWithTryCatch(file: string) {
  try {
    const result = await cloudinary.uploader.upload_large(file, { chunk_size: 6000000 });
    return result;
  } catch (error) {
    console.error('Large upload failed:', error);
    throw error;
  }
}

// ✅ CORRECT: upload_stream with error callback
function uploadStreamWithCallback(buffer: Buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// ✅ CORRECT: destroy with try-catch
async function destroyWithTryCatch(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

export { uploadWithTryCatch, uploadLargeWithTryCatch, uploadStreamWithCallback, destroyWithTryCatch };
