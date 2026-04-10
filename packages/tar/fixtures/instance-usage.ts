/**
 * Demonstrates instance-based and class-wrapped tar usage.
 * Tests detection through service class patterns.
 */
import * as tar from 'tar';

/**
 * Archive service that wraps tar operations.
 */
class ArchiveService {
  private readonly defaultTargetDir: string;

  constructor(targetDir: string) {
    this.defaultTargetDir = targetDir;
  }

  /**
   * ❌ Missing try-catch around tar.extract — should trigger ERROR violation.
   */
  async extractToDefault(archivePath: string): Promise<void> {
    await tar.extract({
      file: archivePath,
      cwd: this.defaultTargetDir,
    });
  }

  /**
   * ✅ Properly wrapped with try-catch — 0 violations expected.
   */
  async extractSafely(archivePath: string, targetDir?: string): Promise<void> {
    try {
      await tar.extract({
        file: archivePath,
        cwd: targetDir ?? this.defaultTargetDir,
      });
    } catch (error) {
      console.error('Extraction failed in service:', error);
      throw new Error(`Archive extraction failed: ${(error as Error).message}`);
    }
  }

  /**
   * ❌ Missing try-catch around tar.create — should trigger ERROR violation.
   */
  async createBackup(outputPath: string, files: string[]): Promise<void> {
    await tar.create(
      {
        file: outputPath,
        cwd: this.defaultTargetDir,
        gzip: true,
      },
      files,
    );
  }
}

/**
 * ❌ Missing try-catch in async event handler — should trigger ERROR violation.
 */
async function processDownloadedArchive(
  archivePath: string,
  extractDir: string,
): Promise<void> {
  await tar.x({
    file: archivePath,
    cwd: extractDir,
    preservePaths: false,
  });
}
