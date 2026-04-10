/**
 * Demonstrates MISSING error handling for tar.extract and tar.create.
 * Should produce ERROR violations.
 */
import { extract, create } from 'tar';
import * as tar from 'tar';

/**
 * ❌ Missing try-catch around tar.extract — should trigger ERROR violation.
 */
async function extractArchiveWithoutErrorHandling(
  archivePath: string,
  targetDir: string,
): Promise<void> {
  await extract({
    file: archivePath,
    cwd: targetDir,
  });
  // If archive is corrupt or cwd is invalid, error propagates unhandled
}

/**
 * ❌ Missing try-catch around tar.x — should trigger ERROR violation.
 */
async function extractWithAliasNoErrorHandling(
  archivePath: string,
  targetDir: string,
): Promise<void> {
  await tar.x({
    file: archivePath,
    cwd: targetDir,
    strip: 1,
  });
  // TAR_BAD_ARCHIVE, CwdError, SymlinkError can be thrown without handling
}

/**
 * ❌ Missing try-catch around tar.create — should trigger ERROR violation.
 */
async function createArchiveWithoutErrorHandling(
  outputPath: string,
  sourceDir: string,
  files: string[],
): Promise<void> {
  await create(
    {
      file: outputPath,
      cwd: sourceDir,
    },
    files,
  );
  // ENOENT, EACCES, CwdError can be thrown without handling
}

/**
 * ❌ Missing try-catch around tar.c — should trigger ERROR violation.
 */
async function createWithAliasNoErrorHandling(outputPath: string, files: string[]): Promise<void> {
  await tar.c(
    {
      file: outputPath,
    },
    files,
  );
  // Filesystem errors propagate unhandled
}
