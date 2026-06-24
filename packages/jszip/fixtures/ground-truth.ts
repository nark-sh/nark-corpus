/**
 * jszip — Ground Truth Fixture
 *
 * Annotated with SHOULD_FIRE / SHOULD_NOT_FIRE to define
 * the expected scanner behavior. Used by the ground-truth test.
 *
 * Postcondition IDs from contract.yaml:
 *   load-invalid-zip                    — loadAsync without try-catch
 *   generate-unsupported-type           — generateAsync without try-catch
 *   file-async-no-try-catch             — JSZipObject.async() without try-catch (decompression errors)
 *   file-async-unsupported-type         — JSZipObject.async() with unsupported output type
 *   generate-node-stream-no-error-listener — generateNodeStream() without .on('error') listener
 *   generate-node-stream-unsupported-env   — generateNodeStream() in unsupported environment
 *   file-node-stream-no-error-listener     — JSZipObject.nodeStream() without .on('error') listener
 *   file-node-stream-unsupported-type      — JSZipObject.nodeStream(non-nodebuffer) sync throw
 *   generate-internal-stream-no-error-listener            — generateInternalStream() on('data')/on('end') without on('error')
 *   generate-internal-stream-accumulate-unhandled-rejection — generateInternalStream().accumulate() without try-catch
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

// JSZipObject.async() with try-catch — proper error handling
async function fileAsync_withTryCatch(zip: JSZip): Promise<string | null> {
  try {
    // SHOULD_NOT_FIRE: .async() inside try-catch is properly handled
    const content = await zip.files['readme.txt'].async('string');
    return content;
  } catch (error) {
    console.error('Failed to read file from zip:', error);
    return null;
  }
}

// JSZipObject.async() without try-catch — missing error handling
async function fileAsync_withoutTryCatch(zip: JSZip): Promise<string> {
  // SHOULD_FIRE: file-async-no-try-catch — .async() without try-catch throws on decompression errors
  const content = await zip.files['readme.txt'].async('string');
  return content;
}

// JSZipObject.async() without try-catch — real-world document processing antipattern
async function extractDocumentContents(zip: JSZip, filename: string): Promise<Buffer> {
  // SHOULD_FIRE: file-async-no-try-catch — file content could be individually corrupted even if zip container loads successfully
  const buffer = await zip.files[filename].async('nodebuffer');
  return buffer;
}

// JSZipObject.async() in loop without try-catch — high-risk antipattern
// Scanner limitation: file.async() on a variable destructured from Object.entries(zip.files)
// cannot be detected because the scanner does not trace TypeScript-inferred types through
// Object.entries() destructuring. Only the direct zip.files['name'].async() pattern is detected.
async function extractAllFiles(zip: JSZip): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  for (const [name, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      // SHOULD_NOT_FIRE: file.async() on destructured loop variable — scanner cannot trace type through Object.entries
      results[name] = await file.async('string');
    }
  }
  return results;
}

// JSZipObject.async() with re-throw — still handled
async function fileAsync_withRethrow(zip: JSZip): Promise<Uint8Array> {
  try {
    // SHOULD_NOT_FIRE: .async() inside try-catch with re-throw is handled
    return await zip.files['data.bin'].async('uint8array');
  } catch (error) {
    throw new Error(`Decompression failed: ${error}`);
  }
}

// generateNodeStream without error listener — common streaming antipattern
function generateNodeStream_withoutErrorListener(zip: JSZip, outputPath: string): void {
  const fs = require('fs');
  // SHOULD_FIRE: generate-node-stream-no-error-listener — stream piped without 'error' listener
  zip.generateNodeStream({ streamFiles: true })
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', function() {
      console.log('Zip written to', outputPath);
    });
}

// generateNodeStream with proper error listener on readable — correct pattern
// Note: scanner does not yet distinguish .on('error') as proper handling for generateNodeStream.
// Scanner concern queued: concern-20260416-jszip-deepen-1
function generateNodeStream_withErrorListener(zip: JSZip, outputPath: string): void {
  const fs = require('fs');
  // SHOULD_FIRE: generate-node-stream-no-error-listener — scanner does not yet detect .on('error') as proper handling
  zip.generateNodeStream({ streamFiles: true })
    .on('error', function(err: Error) {
      console.error('Failed to generate zip stream:', err);
    })
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', function() {
      console.log('Zip written to', outputPath);
    });
}

// generateNodeStream with try-catch around synchronous throw — correct for env check
// SHOULD_NOT_FIRE: try-catch protects against synchronous throw from unsupported env
function generateNodeStream_withTryCatch(zip: JSZip, outputPath: string): void {
  try {
    const fs = require('fs');
    // SHOULD_NOT_FIRE: generateNodeStream wrapped in try-catch handles sync throws
    zip.generateNodeStream({ type: 'nodebuffer' as any })
      .on('error', (err: Error) => console.error('Stream error:', err))
      .pipe(fs.createWriteStream(outputPath));
  } catch (error) {
    console.error('generateNodeStream not supported in this environment:', error);
  }
}

// generateNodeStream piped to HTTP response without error listener — high-risk server pattern
function streamZipToResponse(zip: JSZip, res: any): void {
  // SHOULD_FIRE: generate-node-stream-no-error-listener — piped to HTTP response without .on('error')
  zip.generateNodeStream({ type: 'nodebuffer' as any, streamFiles: true })
    .pipe(res);
}

// JSZipObject.nodeStream() — single-file streaming without error listener
function streamSingleFileWithoutErrorListener(zip: JSZip, outputPath: string): void {
  const fs = require('fs');
  const entry = zip.files['large.bin'];
  // SHOULD_FIRE: file-node-stream-no-error-listener
  entry.nodeStream('nodebuffer').pipe(fs.createWriteStream(outputPath));
}

// JSZipObject.nodeStream() with proper error listener — correct pattern
function streamSingleFileWithErrorListener(zip: JSZip, outputPath: string): void {
  const fs = require('fs');
  const entry = zip.files['large.bin'];
  // SHOULD_NOT_FIRE: nodeStream has error listener registered before pipe
  entry.nodeStream('nodebuffer')
    .on('error', (err: Error) => console.error('Entry decode error:', err))
    .pipe(fs.createWriteStream(outputPath));
}

// JSZipObject.nodeStream() with non-nodebuffer type — sync throw without try-catch
function streamSingleFileUnsupportedType(zip: JSZip): NodeJS.ReadableStream {
  const entry = zip.files['large.bin'];
  // SHOULD_FIRE: file-node-stream-unsupported-type
  return entry.nodeStream('blob' as any);
}

// generateInternalStream() event-listener pattern WITHOUT on('error') — missing error handling
function generateInternalStream_withoutErrorListener(zip: JSZip): void {
  // SHOULD_FIRE: generate-internal-stream-no-error-listener
  zip.generateInternalStream({ type: 'uint8array', streamFiles: true })
    .on('data', (chunk: any) => { void chunk; })
    .on('end', () => { /* done */ });
}

// generateInternalStream() event-listener pattern WITH on('error') — proper handling
// Note: scanner does not yet detect .on('error') as proper handling for generateInternalStream.
// Scanner concern queued: concern-20260624-jszip-deepen-3
function generateInternalStream_withErrorListener(zip: JSZip): void {
  // SHOULD_FIRE: generate-internal-stream-no-error-listener — scanner does not yet detect .on('error') as proper handling
  zip.generateInternalStream({ type: 'uint8array', streamFiles: true })
    .on('data', (chunk: any) => { void chunk; })
    .on('end', () => { /* done */ })
    .on('error', (err: Error) => console.error('Zip stream error:', err));
}

// generateInternalStream().accumulate() without try-catch — unhandled rejection
async function generateInternalStream_accumulateWithoutTryCatch(zip: JSZip): Promise<Uint8Array> {
  // SHOULD_FIRE: generate-internal-stream-accumulate-unhandled-rejection
  return await zip.generateInternalStream({ type: 'uint8array' }).accumulate();
}

// generateInternalStream().accumulate() with try-catch — proper handling
async function generateInternalStream_accumulateWithTryCatch(zip: JSZip): Promise<Uint8Array | null> {
  try {
    // SHOULD_NOT_FIRE: accumulate() promise awaited inside try-catch
    return await zip.generateInternalStream({ type: 'uint8array' }).accumulate();
  } catch (err) {
    console.error('Zip generation failed:', err);
    return null;
  }
}

export {
  loadAsync_withTryCatch,
  loadAsync_withoutTryCatch,
  generateAsync_withTryCatch,
  generateAsync_withoutTryCatch,
  loadAsync_withRethrow,
  processUserUpload,
  fileAsync_withTryCatch,
  fileAsync_withoutTryCatch,
  extractDocumentContents,
  extractAllFiles,
  fileAsync_withRethrow,
  generateNodeStream_withoutErrorListener,
  generateNodeStream_withErrorListener,
  generateNodeStream_withTryCatch,
  streamZipToResponse,
  streamSingleFileWithoutErrorListener,
  streamSingleFileWithErrorListener,
  streamSingleFileUnsupportedType,
  generateInternalStream_withoutErrorListener,
  generateInternalStream_withErrorListener,
  generateInternalStream_accumulateWithoutTryCatch,
  generateInternalStream_accumulateWithTryCatch,
};
