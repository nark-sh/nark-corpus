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
 * Postconditions added 2026-06-18 deepen pass 7 (no scanner detection yet — concerns queued):
 *   - append-directory-entry-unsupported (concern-20260618-archiver-deepen-1)
 *   - symlink-missing-filepath           (concern-20260618-archiver-deepen-2)
 *   - symlink-missing-target             (concern-20260618-archiver-deepen-3)
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. append-directory-entry-unsupported — append({ type: 'directory' }) on JSON archiver
// ─────────────────────────────────────────────────────────────────────────────
// Reference fixtures for postconditions added 2026-06-18 (no scanner detection yet).

export async function appendDirectoryEntryOnJsonFormat() {
  const output = fs.createWriteStream('archive.json');
  const archive = archiver('json');
  archive.on('error', (err) => { throw err; });
  archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
  archive.pipe(output);
  // Reference: append-directory-entry-unsupported — JSON archiver emits DIRECTORYNOTSUPPORTED;
  // entry is silently dropped. Detection requires scanner concern-20260618-archiver-deepen-1.
  archive.append(Buffer.from(''), { name: 'subdir/', type: 'directory' });
  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. symlink-missing-filepath / symlink-missing-target — argument validation gaps
// ─────────────────────────────────────────────────────────────────────────────
// Reference fixtures for postconditions added 2026-06-18 (no scanner detection yet).

export async function symlinkMissingFilepathArgument() {
  const output = fs.createWriteStream('archive.tar');
  const archive = archiver('tar');
  archive.on('error', (err) => { throw err; });
  archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
  archive.pipe(output);
  // Reference: symlink-missing-filepath — empty-string filepath emits SYMLINKFILEPATHREQUIRED.
  // Detection requires scanner concern-20260618-archiver-deepen-2.
  archive.symlink('', '/target/path');
  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}

export async function symlinkMissingTargetArgument() {
  const output = fs.createWriteStream('archive.tar');
  const archive = archiver('tar');
  archive.on('error', (err) => { throw err; });
  archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
  archive.pipe(output);
  // Reference: symlink-missing-target — empty-string target emits SYMLINKTARGETREQUIRED.
  // Detection requires scanner concern-20260618-archiver-deepen-3.
  archive.symlink('link.txt', '');
  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}

export async function symlinkWithValidArguments() {
  const output = fs.createWriteStream('archive.tar');
  const archive = archiver('tar');
  archive.on('error', (err) => { throw err; });
  archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
  archive.pipe(output);
  // Reference: valid filepath and target; tar format supports symlinks. NOTE: scanner
  // cannot statically distinguish zip vs tar archives at the symlink() call site, so it
  // will currently emit symlink-zip-format-unsupported here as a known FP. Detection
  // improvement tracked separately under scanner-upgrades backlog.
  archive.symlink('link.txt', '/target/path.txt');
  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}
