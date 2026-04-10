/**
 * jszip — Ground Truth Fixture
 *
 * Annotated with SHOULD_FIRE / SHOULD_NOT_FIRE to define
 * the expected scanner behavior. Used by the ground-truth test.
 *
 * Postcondition IDs from contract.yaml:
 *   load-invalid-zip          — loadAsync without try-catch
 *   generate-unsupported-type — generateAsync without try-catch
 */
import JSZip from 'jszip';

// loadAsync with try-catch — proper error handling
async function loadAsync_withTryCatch(data: ArrayBuffer): Promise<JSZip | null> {
  try {
    // SHOULD_NOT_FIRE: loadAsync inside try-catch is properly handled
    return await JSZip.loadAsync(data);
  } catch (error) {
    console.error('Failed to load zip:', error);
    return null;
  }
}

// loadAsync without try-catch — missing error handling
async function loadAsync_withoutTryCatch(data: ArrayBuffer): Promise<JSZip> {
  // SHOULD_FIRE: load-invalid-zip — loadAsync without try-catch throws on invalid zip
  return await JSZip.loadAsync(data);
}

// generateAsync with try-catch — proper error handling
async function generateAsync_withTryCatch(zip: JSZip): Promise<Blob | null> {
  try {
    // SHOULD_NOT_FIRE: generateAsync inside try-catch is properly handled
    return await zip.generateAsync({ type: 'blob' });
  } catch (error) {
    console.error('Failed to generate zip:', error);
    return null;
  }
}

// generateAsync without try-catch — missing error handling
async function generateAsync_withoutTryCatch(zip: JSZip): Promise<Blob> {
  // SHOULD_FIRE: generate-unsupported-type — generateAsync without try-catch can throw on unsupported type
  return await zip.generateAsync({ type: 'blob' });
}

// loadAsync with re-throw — still handled
async function loadAsync_withRethrow(buffer: Buffer): Promise<JSZip> {
  try {
    // SHOULD_NOT_FIRE: loadAsync inside try-catch with re-throw is handled
    return await JSZip.loadAsync(buffer);
  } catch (error) {
    throw new Error(`Invalid zip: ${error}`);
  }
}

// User upload without error handling — real-world antipattern
async function processUserUpload(file: File): Promise<string[]> {
  // SHOULD_FIRE: load-invalid-zip — user-uploaded file could be invalid zip without try-catch
  const zip = await JSZip.loadAsync(file);
  const names: string[] = [];
  zip.forEach((relativePath) => names.push(relativePath));
  return names;
}

export {
  loadAsync_withTryCatch,
  loadAsync_withoutTryCatch,
  generateAsync_withTryCatch,
  generateAsync_withoutTryCatch,
  loadAsync_withRethrow,
  processUserUpload,
};
