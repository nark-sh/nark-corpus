import archiver from 'archiver';
import * as fs from 'fs';

/**
 * Proper error handling with read streams
 * Should NOT trigger violations
 *
 * When using append() with read streams, errors from the source stream
 * may not propagate to the archive 'error' event. Must handle errors
 * on both the archive and the source stream.
 */
function createZipWithStreamErrorHandling() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  // ✅ Archive error handler
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    throw err;
  });

  // ✅ Archive warning handler
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('File not found:', err);
    } else {
      throw err;
    }
  });

  archive.pipe(output);

  // ✅ Read stream with error handler
  const readStream = fs.createReadStream('large-file.txt');
  readStream.on('error', (err) => {
    console.error('Read stream error:', err);
    archive.emit('error', err);
  });

  archive.append(readStream, { name: 'large-file.txt' });
  archive.finalize();
}

/**
 * Missing read stream error handling
 * Should trigger WARNING violation
 *
 * Read stream errors are not handled, may result in unhandled errors.
 */
function createZipWithoutStreamErrorHandling() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  // ✅ Archive error handler
  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // ❌ Read stream without error handler - errors may not propagate
  const readStream = fs.createReadStream('large-file.txt');
  archive.append(readStream, { name: 'large-file.txt' });

  archive.finalize();
}
