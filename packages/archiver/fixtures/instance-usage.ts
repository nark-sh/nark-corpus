import archiver from 'archiver';
import * as fs from 'fs';

/**
 * Instance usage with proper error handling
 * Should NOT trigger violations
 *
 * Tests detection of archiver usage via variable assignments.
 */
function createZipWithInstance() {
  const output = fs.createWriteStream('archive.zip');

  // ✅ Instance with error handler
  const zip = archiver('zip', { zlib: { level: 9 } });

  zip.on('error', (err) => {
    throw err;
  });

  zip.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('File not found:', err);
    } else {
      throw err;
    }
  });

  zip.pipe(output);
  zip.file('file1.txt', { name: 'file1.txt' });
  zip.finalize();
}

/**
 * Instance usage without error handling
 * Should trigger ERROR violation
 */
function createZipWithInstanceBadly() {
  const output = fs.createWriteStream('archive.zip');

  // ❌ Instance without error handler
  const zip = archiver('zip', { zlib: { level: 9 } });

  zip.pipe(output);
  zip.file('file1.txt', { name: 'file1.txt' });
  zip.finalize();
}

/**
 * Class-based usage with proper error handling
 * Should NOT trigger violations
 */
class ArchiveService {
  private archive: archiver.Archiver;

  constructor() {
    this.archive = archiver('zip', { zlib: { level: 9 } });

    // ✅ Error handler in constructor
    this.archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    this.archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('File not found:', err);
      }
    });
  }

  addFile(filepath: string, name: string) {
    this.archive.file(filepath, { name });
  }

  async finalize(output: fs.WriteStream) {
    this.archive.pipe(output);
    await this.archive.finalize();
  }
}

/**
 * Class-based usage without error handling
 * Should trigger ERROR violation
 */
class ArchiveServiceBadly {
  private archive: archiver.Archiver;

  constructor() {
    // ❌ No error handler
    this.archive = archiver('zip', { zlib: { level: 9 } });
  }

  addFile(filepath: string, name: string) {
    this.archive.file(filepath, { name });
  }

  async finalize(output: fs.WriteStream) {
    this.archive.pipe(output);
    await this.archive.finalize();
  }
}
