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

// ─────────────────────────────────────────────────────────────────────────────
// 3. cloudinary.uploader.update_metadata() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMetadataNoCatch(publicIds: string[]) {
  // SHOULD_FIRE: update-metadata-missing-error-handling — update_metadata() rejects on invalid field IDs (HTTP 400) or auth failures (HTTP 401). No try-catch.
  const result = await cloudinary.uploader.update_metadata('field1=value1', publicIds);
  return result;
}

export async function updateMetadataWithCatch(publicIds: string[]) {
  try {
    // SHOULD_NOT_FIRE: update_metadata() inside try-catch satisfies error handling
    const result = await cloudinary.uploader.update_metadata('field1=value1', publicIds);
    return result;
  } catch (err) {
    console.error('Metadata update failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. cloudinary.api.update() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function apiUpdateNoCatch(publicId: string) {
  // SHOULD_FIRE: api-update-missing-error-handling — api.update() rejects on 404 (asset not found), 401 (auth), 420 (rate limit). No try-catch.
  const result = await cloudinary.api.update(publicId, { tags: ['reviewed'] });
  return result;
}

export async function apiUpdateWithCatch(publicId: string) {
  try {
    // SHOULD_NOT_FIRE: api.update() inside try-catch satisfies error handling
    const result = await cloudinary.api.update(publicId, { tags: ['reviewed'] });
    return result;
  } catch (err) {
    console.error('API update failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. cloudinary.api.delete_resources_by_tag() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteByTagNoCatch(tag: string) {
  // SHOULD_FIRE: delete-resources-by-tag-missing-error-handling — rejects on auth failure (HTTP 401), rate limit (HTTP 420). No try-catch.
  const result = await cloudinary.api.delete_resources_by_tag(tag);
  return result;
}

export async function deleteByTagWithCatch(tag: string) {
  try {
    // SHOULD_NOT_FIRE: delete_resources_by_tag() inside try-catch satisfies error handling
    const result = await cloudinary.api.delete_resources_by_tag(tag);
    return result;
  } catch (err) {
    console.error('Delete by tag failed:', err);
    throw err;
  }
}
