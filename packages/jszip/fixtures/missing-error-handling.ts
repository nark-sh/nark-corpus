/**
 * jszip — MISSING error handling examples.
 * These should produce ERROR violations.
 */
import JSZip from 'jszip';

/**
 * Missing try-catch on loadAsync — should trigger ERROR violation.
 * If data is corrupt or invalid zip, throws unhandled Error.
 */
async function loadZipNoErrorHandling(data: ArrayBuffer): Promise<JSZip> {
  // ❌ No try-catch — corrupted/invalid zip will throw
  const zip = await JSZip.loadAsync(data);
  return zip;
}

/**
 * Missing try-catch on generateAsync — should trigger ERROR violation.
 * If type is unsupported in browser, throws Error.
 */
async function generateZipNoErrorHandling(zip: JSZip): Promise<Blob> {
  // ❌ No try-catch — unsupported type will throw
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

/**
 * Real-world pattern: loading user-uploaded file without try-catch.
 * Should trigger ERROR violation.
 */
async function processUploadedFile(file: File): Promise<string[]> {
  // ❌ No try-catch — user-uploaded zip could be invalid
  const zip = await JSZip.loadAsync(file);
  const fileNames: string[] = [];
  zip.forEach((relativePath) => {
    fileNames.push(relativePath);
  });
  return fileNames;
}

export { loadZipNoErrorHandling, generateZipNoErrorHandling, processUploadedFile };
