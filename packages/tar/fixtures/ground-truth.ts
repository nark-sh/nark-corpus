/**
 * Ground-truth fixture for tar.
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the tar contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - tar.extract() / tar.x() return Promise<void> when file: option is set
 *   - tar.create() / tar.c() return Promise<void> when file: option is set
 *   - tar.list() / tar.t() return Promise<void> when file: option is set
 *   - tar.replace() / tar.r() require file: option, throw TypeError for compressed archives
 *   - tar.update() / tar.u() require file: option, throw TypeError for compressed archives
 *   - All async tar calls MUST be wrapped in try-catch
 *   - Can throw: TAR_BAD_ARCHIVE, TAR_ENTRY_ERROR, TAR_ABORT, CwdError, SymlinkError, ENOENT, EACCES
 *   - replace/update/r/u also throw: TypeError('cannot append to compressed archives')
 */

import { extract, create, list, replace, update } from 'tar';
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. list() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: list-error-handling
export async function listNoCatch(archivePath: string): Promise<string[]> {
  const entries: string[] = [];
  // SHOULD_FIRE: list-error-handling — tar.list with file: returns Promise that rejects, no try-catch
  await list({
    file: archivePath,
    onReadEntry: (entry) => entries.push(entry.path),
  });
  return entries;
}

// @expect-violation: list-error-handling
export async function listAliasNoCatch(archivePath: string): Promise<void> {
  // SHOULD_FIRE: list-error-handling — tar.t (alias for list) with file:, no try-catch
  await tar.t({ file: archivePath, onReadEntry: (e) => console.log(e.path) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. list() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-clean
export async function listWithCatch(archivePath: string): Promise<string[]> {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const entries: string[] = [];
    await list({
      file: archivePath,
      onReadEntry: (entry) => entries.push(entry.path),
    });
    return entries;
  } catch (error) {
    console.error('Failed to list archive:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. replace() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: replace-error-handling
export async function replaceNoCatch(archivePath: string, files: string[]): Promise<void> {
  // SHOULD_FIRE: replace-* — tar.replace with file: returns Promise that rejects, no try-catch
  await replace({ file: archivePath }, files);
}

// @expect-violation: replace-error-handling
export async function replaceAliasNoCatch(archivePath: string, files: string[]): Promise<void> {
  // SHOULD_FIRE: replace-* — tar.r (alias) with file:, no try-catch
  await tar.r({ file: archivePath }, files);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. replace() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-clean
export async function replaceWithCatch(archivePath: string, files: string[]): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await replace({ file: archivePath }, files);
  } catch (error) {
    console.error('Failed to replace archive entry:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. update() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: update-error-handling
export async function updateNoCatch(archivePath: string, files: string[]): Promise<void> {
  // SHOULD_FIRE: update-* — tar.update with file: returns Promise that rejects, no try-catch
  await update({ file: archivePath }, files);
}

// @expect-violation: update-error-handling
export async function updateAliasNoCatch(archivePath: string, files: string[]): Promise<void> {
  // SHOULD_FIRE: update-* — tar.u (alias) with file:, no try-catch
  await tar.u({ file: archivePath }, files);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. update() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-clean
export async function updateWithCatch(archivePath: string, files: string[]): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await update({ file: archivePath }, files);
  } catch (error) {
    console.error('Failed to update archive:', error);
    throw error;
  }
}
