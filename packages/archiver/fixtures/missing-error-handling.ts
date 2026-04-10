import archiver from 'archiver';
import * as fs from 'fs';

// Missing error handling - no error/warning listeners
function createZip() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.file('file1.txt', { name: 'file1.txt' });
  archive.directory('subdir/', 'new-subdir');
  archive.finalize();
}
