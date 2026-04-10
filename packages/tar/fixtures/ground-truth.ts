/**
 * Ground-truth fixture for tar.
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the tar contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - tar.extract() / tar.x() return Promise<void> when file: option is set
 *   - tar.create() / tar.c() return Promise<void> when file: option is set
 *   - All async tar calls MUST be wrapped in try-catch
 *   - Can throw: TAR_BAD_ARCHIVE, TAR_ENTRY_ERROR, TAR_ABORT, CwdError, SymlinkError, ENOENT, EACCES
 */

import { extract, create } from 'tar';
import * as tar from 'tar';

// ─────────────────────────────────────────────────────────────────────────────
// 1. extract() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function extractNoCatch(archivePath: string, targetDir: string): Promise<void> {
  // SHOULD_FIRE: extract-error-handling — tar.extract with file: returns Promise that rejects, no try-catch
  await extract({ file: archivePath, cwd: targetDir });
}

export async function extractAliasNoCatch(archivePath: string, targetDir: string): Promise<void> {
  // SHOULD_FIRE: extract-error-handling — tar.x (alias for extract) with file: returns Promise that rejects, no try-catch
  await tar.x({ file: archivePath, cwd: targetDir, strip: 1 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. extract() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function extractWithCatch(archivePath: string, targetDir: string): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await extract({ file: archivePath, cwd: targetDir });
  } catch (error) {
    console.error('Failed to extract:', error);
    throw error;
  }
}

export async function extractAliasWithCatch(archivePath: string, targetDir: string): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await tar.x({ file: archivePath, cwd: targetDir });
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. create() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function createNoCatch(outputPath: string, files: string[]): Promise<void> {
  // SHOULD_FIRE: create-error-handling — tar.create with file: returns Promise that rejects, no try-catch
  await create({ file: outputPath, gzip: true }, files);
}

export async function createAliasNoCatch(outputPath: string, files: string[]): Promise<void> {
  // SHOULD_FIRE: create-error-handling — tar.c (alias) with file: returns Promise that rejects, no try-catch
  await tar.c({ file: outputPath }, files);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. create() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function createWithCatch(outputPath: string, files: string[]): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await create({ file: outputPath }, files);
  } catch (error) {
    console.error('Failed to create archive:', error);
    throw error;
  }
}
