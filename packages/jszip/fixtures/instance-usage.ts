/**
 * jszip — Instance usage examples.
 * Tests detection of JSZip instance method calls.
 */
import JSZip from 'jszip';

class DocumentExporter {
  private zip: JSZip;

  constructor() {
    this.zip = new JSZip();
  }

  addFile(name: string, content: string): void {
    this.zip.file(name, content);
  }

  /**
   * Missing try-catch on instance generateAsync — should trigger ERROR violation.
   */
  async exportNoErrorHandling(): Promise<Blob> {
    // ❌ No try-catch — generateAsync can fail if type unsupported
    const blob = await this.zip.generateAsync({ type: 'blob' });
    return blob;
  }

  /**
   * Proper try-catch on instance generateAsync — should NOT trigger violation.
   */
  async exportWithErrorHandling(): Promise<Blob | null> {
    try {
      const blob = await this.zip.generateAsync({ type: 'blob' });
      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }
}

/**
 * Static method via instance — missing try-catch.
 * Should trigger ERROR violation.
 */
async function loadFromBuffer(buffer: Buffer): Promise<JSZip> {
  const jszip = new JSZip();
  // ❌ No try-catch — loadAsync can fail on invalid buffer
  const zip = await jszip.loadAsync(buffer);
  return zip;
}

export { DocumentExporter, loadFromBuffer };
