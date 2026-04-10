/**
 * jszip — PROPER error handling examples.
 * These should produce 0 violations.
 */
import JSZip from 'jszip';

/**
 * Properly wrapped loadAsync — should NOT trigger violation.
 */
async function loadZipWithErrorHandling(data: ArrayBuffer): Promise<JSZip | null> {
  try {
    const zip = await JSZip.loadAsync(data);
    return zip;
  } catch (error) {
    console.error('Failed to load zip:', error);
    return null;
  }
}

/**
 * Properly wrapped generateAsync — should NOT trigger violation.
 */
async function generateZipWithErrorHandling(zip: JSZip): Promise<Blob | null> {
  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  } catch (error) {
    console.error('Failed to generate zip:', error);
    return null;
  }
}

/**
 * loadAsync in try-catch with re-throw — should NOT trigger violation.
 */
async function loadAndProcessZip(fileBuffer: Buffer): Promise<string[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(fileBuffer);
  } catch (error) {
    throw new Error(`Invalid zip file: ${error instanceof Error ? error.message : String(error)}`);
  }

  const fileNames: string[] = [];
  zip.forEach((relativePath) => {
    fileNames.push(relativePath);
  });
  return fileNames;
}

export { loadZipWithErrorHandling, generateZipWithErrorHandling, loadAndProcessZip };
