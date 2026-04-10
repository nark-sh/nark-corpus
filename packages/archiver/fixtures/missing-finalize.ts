import archiver from 'archiver';
import * as fs from 'fs';

/**
 * Missing finalize() call
 * Should trigger ERROR violation
 *
 * Without finalize(), the archive is never completed and the process
 * may exit silently once the event loop is empty.
 */
function createZipWithoutFinalize() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  // ✅ Has error handler
  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.file('file1.txt', { name: 'file1.txt' });
  archive.directory('subdir/', 'new-subdir');

  // ❌ Missing finalize() - archive never completes
}
