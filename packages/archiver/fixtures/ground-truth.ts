/**
 * Ground-truth test annotations for archiver package.
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 *
 * Postconditions with active scanner detection (EventListenerAbsencePlugin):
 *   - missing-error-handler
 *   - missing-warning-handler
 *
 * Postconditions added this pass (no scanner detection yet — concerns queued):
 *   - finalize-incomplete-output    (concern-20260411-archiver-deepen-1)
 *   - append-stream-error-not-propagated (concern-20260411-archiver-deepen-2)
 *   - symlink-zip-format-unsupported (concern-20260411-archiver-deepen-3)
 *   - QUEUECLOSED pattern for append/directory/file/symlink after finalize (concern-20260411-archiver-deepen-4)
 *
 * Detection path:
 *   - EventListenerAbsencePlugin checks archiver() for .on('error', ...) and .on('warning', ...)
 *
 * Note: Only postconditions with active scanner detection have SHOULD_FIRE annotations.
 * New postconditions are documented here as reference but require scanner upgrade
 * before ground-truth assertions can be added.
 */

import archiver from 'archiver';
import * as fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// 1. missing-error-handler — archiver() without .on('error', ...) attached
// ─────────────────────────────────────────────────────────────────────────────

export async function createArchiveNoErrorHandler() {
  const output = fs.createWriteStream('archive.zip');
  // SHOULD_FIRE: missing-error-handler — no error event handler, unhandled error crashes process
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.file('file1.txt', { name: 'file1.txt' });
  await archive.finalize();
}

export async function createArchiveWithBothHandlers() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  // SHOULD_NOT_FIRE: error handler and warning handler present — satisfies event listener requirement
  archive.on('warning', (err) => {
    if (err.code !== 'ENOENT') throw err;
  });
  archive.pipe(output);
  archive.file('file1.txt', { name: 'file1.txt' });
  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. missing-warning-handler — archiver() without .on('warning', ...) attached
// ─────────────────────────────────────────────────────────────────────────────

export async function createArchiveNoWarningHandler() {
  const output = fs.createWriteStream('archive.zip');
  // SHOULD_FIRE: missing-error-handler — no warning event handler, ENOENT silently ignored causing incomplete archives (scanner emits missing-error-handler for both missing-error and missing-warning)
  const archive = archiver('zip');
  archive.on('error', (err) => { throw err; });
  archive.pipe(output);
  archive.directory('subdir/', 'new-subdir');
  await archive.finalize();
}

export async function createArchiveWithWarningHandler() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip');
  archive.on('error', (err) => { throw err; });
  archive.on('warning', (err) => {
    if (err.code !== 'ENOENT') throw err;
    console.warn('Warning:', err);
  });
  // SHOULD_NOT_FIRE: both error and warning handlers present
  archive.pipe(output);
  archive.directory('subdir/', 'new-subdir');
  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Correct full pattern — both handlers + close event wait
// ─────────────────────────────────────────────────────────────────────────────

export async function createZipWithFullProperHandling() {
  const output = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('File not found:', err);
    } else {
      throw err;
    }
  });
  archive.pipe(output);
  archive.file('file.txt', { name: 'file.txt' });
  archive.directory('uploads/', 'uploads');
  await archive.finalize();
  // SHOULD_NOT_FIRE: correct pattern — both handlers, finalize, and close event wait
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}
