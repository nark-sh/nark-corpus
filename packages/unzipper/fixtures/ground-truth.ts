/**
 * Ground-truth test fixtures for unzipper contract depth pass.
 *
 * Each function is annotated with @expect-violation or @expect-clean.
 * Postcondition IDs correspond to unzipper/contract.yaml.
 *
 * Evidence sources:
 *   - lib/parseOne.js: PATTERN_NOT_FOUND error string
 *   - lib/Open/unzip.js: MISSING_PASSWORD, BAD_PASSWORD error strings
 *   - lib/Open/directory.js: PATH_MISSING error string
 *   - lib/Open/index.js: 'Missing content length header' error string
 *   - lib/PullStream.js: FILE_ENDED error string
 *   - https://raw.githubusercontent.com/ZJONSSON/node-unzipper/master/README.md
 */

import * as fs from 'fs';
import unzipper from 'unzipper';

// ---------------------------------------------------------------------------
// VIOLATION CASES — scanner SHOULD flag these
// ---------------------------------------------------------------------------

// @expect-violation: parseone-pattern-not-found
// @expect-violation: parseone-corrupt-archive-error
async function parseOneWithoutErrorHandling() {
  const content = await fs.createReadStream('archive.zip')
    .pipe(unzipper.ParseOne(/config\.json$/))
    .buffer();
  return content.toString();
}

// @expect-violation: parseone-pattern-not-found
async function parseOneBufferNoMatch() {
  const result = await fs.createReadStream('archive.zip')
    .pipe(unzipper.ParseOne('nonexistent-file.txt'))
    .buffer();
  return result;
}

// @expect-violation: open-buffer-invalid-zip
async function openBufferNoTryCatch(zipData: Buffer) {
  const directory = await unzipper.Open.buffer(zipData);
  const files = await directory.files;
  return files.length;
}

// @expect-violation: open-url-missing-content-length
// @expect-violation: open-url-network-error
async function openUrlNoTryCatch() {
  const request = require('request');
  const directory = await unzipper.Open.url(request, 'https://example.com/archive.zip');
  const files = await directory.files;
  return files;
}

// @expect-violation: open-s3v3-not-found-or-access-denied
async function openS3v3NoTryCatch(s3Client: any) {
  const directory = await unzipper.Open.s3_v3(s3Client, {
    Bucket: 'my-bucket',
    Key: 'archives/data.zip',
  });
  const files = await directory.files;
  return files;
}

// @expect-violation: extract-path-missing
// @expect-violation: extract-filesystem-error
async function centralDirectoryExtractNoTryCatch() {
  const directory = await unzipper.Open.file('archive.zip');
  await directory.extract({ path: '/tmp/output' });
}

// @expect-violation: entry-buffer-missing-password
// @expect-violation: entry-buffer-decompression-error
async function fileBufferNoTryCatch() {
  const directory = await unzipper.Open.file('archive.zip');
  const files = await directory.files;
  for (const file of files) {
    if (file.type === 'File') {
      const content = await file.buffer();
      console.log(file.path, content.length);
    }
  }
}

// @expect-violation: entry-buffer-missing-password
// @expect-violation: entry-buffer-decompression-error
async function entryBufferInParseStream() {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream('archive.zip')
      .pipe(unzipper.Parse())
      .on('entry', async (entry: any) => {
        const content = await entry.buffer();
        console.log(entry.path, content.length);
      })
      .on('finish', resolve)
      .on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// CLEAN CASES — scanner should NOT flag these
// ---------------------------------------------------------------------------

// @expect-clean
async function parseOneWithTryCatch() {
  try {
    const content = await fs.createReadStream('archive.zip')
      .pipe(unzipper.ParseOne(/config\.json$/))
      .buffer();
    return content.toString();
  } catch (error: any) {
    if (error.message === 'PATTERN_NOT_FOUND') {
      console.warn('Config file not found in archive');
      return null;
    }
    if (error.message && error.message.startsWith('invalid signature')) {
      throw new Error('Not a valid ZIP file');
    }
    throw error;
  }
}

// @expect-clean
async function openBufferWithTryCatch(zipData: Buffer) {
  try {
    const directory = await unzipper.Open.buffer(zipData);
    const files = await directory.files;
    return files.length;
  } catch (error: any) {
    if (error.message === 'FILE_ENDED') {
      throw new Error('Buffer is not a valid ZIP archive');
    }
    throw error;
  }
}

// @expect-clean
async function centralDirectoryExtractWithTryCatch() {
  const directory = await unzipper.Open.file('archive.zip');
  try {
    await directory.extract({ path: '/tmp/output', concurrency: 4 });
  } catch (error: any) {
    if (error.message === 'PATH_MISSING') {
      throw new Error('Extraction path is required');
    }
    if (error.code === 'EACCES') {
      throw new Error('Permission denied writing to destination');
    }
    throw error;
  }
}

// @expect-clean
async function fileBufferWithPasswordHandling(password?: string) {
  const directory = await unzipper.Open.file('archive.zip');
  const files = await directory.files;
  const results: Array<{ path: string; content: Buffer | null; error?: string }> = [];
  for (const file of files) {
    if (file.type !== 'File') continue;
    try {
      const content = await file.buffer(password);
      results.push({ path: file.path, content });
    } catch (error: any) {
      if (error.message === 'MISSING_PASSWORD') {
        results.push({ path: file.path, content: null, error: 'encrypted' });
      } else if (error.message === 'BAD_PASSWORD') {
        results.push({ path: file.path, content: null, error: 'bad_password' });
      } else {
        throw error;
      }
    }
  }
  return results;
}

// @expect-clean
async function openS3v3WithErrorHandling(s3Client: any) {
  try {
    const directory = await unzipper.Open.s3_v3(s3Client, {
      Bucket: 'my-bucket',
      Key: 'archives/data.zip',
    });
    return await directory.files;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      throw new Error('Archive not found in S3');
    }
    if (error.$metadata?.httpStatusCode === 403) {
      throw new Error('Access denied to S3 archive');
    }
    throw error;
  }
}
