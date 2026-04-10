/**
 * cloudinary Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "cloudinary"):
 *   - cloudinary.uploader.upload()    postcondition: upload-missing-error-handling
 *   - cloudinary.uploader.destroy()   postcondition: destroy-missing-error-handling
 *
 * Detection path: cloudinary.uploader.upload() →
 *   ThrowingFunctionDetector fires 3-level chain call →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloud_name: 'demo', api_key: 'key', api_secret: 'secret' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. cloudinary.uploader.upload() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadNoCatch(file: string) {
  // SHOULD_FIRE: upload-missing-error-handling — upload() throws on network/auth errors. No try-catch.
  const result = await cloudinary.uploader.upload(file);
  return result;
}

export async function uploadWithCatch(file: string) {
  try {
    // SHOULD_NOT_FIRE: upload() inside try-catch satisfies error handling
    const result = await cloudinary.uploader.upload(file);
    return result;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. cloudinary.uploader.destroy() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function destroyNoCatch(publicId: string) {
  // SHOULD_FIRE: destroy-missing-error-handling — destroy() throws on network/auth errors. No try-catch.
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export async function destroyWithCatch(publicId: string) {
  try {
    // SHOULD_NOT_FIRE: destroy() inside try-catch satisfies error handling
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error('Destroy failed:', err);
    throw err;
  }
}
