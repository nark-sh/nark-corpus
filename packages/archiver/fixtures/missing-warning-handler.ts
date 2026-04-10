import archiver from 'archiver';
import * as fs from 'fs';

/**
 * Missing 'warning' event listener
 * Should trigger WARNING violation
 *
 * Has 'error' listener but no 'warning' listener.
 * Non-blocking errors like ENOENT will be silently ignored.
 */
function createZipWithoutWarningHandler() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  // ✅ Has error handler
  archive.on('error', (err) => {
    throw err;
  });

  // ❌ Missing warning handler - non-blocking errors silently ignored

  archive.pipe(output);
  archive.file('file1.txt', { name: 'file1.txt' });
  archive.directory('subdir/', 'new-subdir');
  archive.finalize();
}
