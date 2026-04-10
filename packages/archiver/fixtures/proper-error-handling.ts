import archiver from 'archiver';
import * as fs from 'fs';

// Proper error handling with error and warning listeners
function createZip() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw err;
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('File not found:', err);
    } else {
      throw err;
    }
  });

  archive.pipe(output);
  archive.file('file1.txt', { name: 'file1.txt' });
  archive.directory('subdir/', 'new-subdir');
  archive.finalize();
}
