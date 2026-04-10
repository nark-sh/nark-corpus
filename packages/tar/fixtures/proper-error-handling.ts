/**
 * Demonstrates PROPER error handling for tar.extract and tar.create.
 * Should produce 0 violations.
 */
import { extract, create } from 'tar';
import * as tar from 'tar';

/**
 * Correctly wraps tar.extract with try-catch — 0 violations expected.
 */
async function extractArchiveWithErrorHandling(
  archivePath: string,
  targetDir: string,
): Promise<void> {
  try {
    await extract({
      file: archivePath,
      cwd: targetDir,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to extract archive:', error.message, (error as any).code);
    }
    throw error;
  }
}

/**
 * Correctly wraps tar.x with try-catch — 0 violations expected.
 */
async function extractWithAlias(archivePath: string, targetDir: string): Promise<void> {
  try {
    await tar.x({
      file: archivePath,
      cwd: targetDir,
      strip: 1,
    });
  } catch (error) {
    console.error('Extraction failed:', error);
    throw error;
  }
}

/**
 * Correctly wraps tar.create with try-catch — 0 violations expected.
 */
async function createArchiveWithErrorHandling(
  outputPath: string,
  sourceDir: string,
  files: string[],
): Promise<void> {
  try {
    await create(
      {
        file: outputPath,
        cwd: sourceDir,
        gzip: true,
      },
      files,
    );
  } catch (error) {
    console.error('Failed to create archive:', error);
    throw error;
  }
}

/**
 * Correctly wraps tar.c (alias) with try-catch — 0 violations expected.
 */
async function createWithAlias(outputPath: string, files: string[]): Promise<void> {
  try {
    await tar.c(
      {
        file: outputPath,
        gzip: false,
      },
      files,
    );
  } catch (error) {
    console.error('Archive creation failed:', error);
    throw error;
  }
}
