/**
 * fs-extra Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the fs-extra contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - readJson throws ENOENT (missing file) and SyntaxError (invalid JSON) → MUST try-catch
 *   - copy throws ENOENT (source not found) and EACCES (permissions) → MUST try-catch
 *   - move throws ENOENT, EACCES, and "dest already exists" → MUST try-catch
 *   - outputFile throws EACCES (no write permission), ENOSPC (disk full) → MUST try-catch
 *   - writeJson throws ENOENT (parent dir missing), EACCES, TypeError (circular ref) → MUST try-catch
 *   - ensureDir throws EACCES (permission denied), ENOTDIR (path component is file) → MUST try-catch
 *   - remove throws EACCES/EPERM (permission denied) — force:true only silences ENOENT → MUST try-catch
 *   - outputJson throws TypeError (circular ref), EACCES → MUST try-catch
 *   - ensureFile throws EACCES (permission), ENOTDIR (path component is file) → MUST try-catch
 *   - mkdirp throws EACCES, ENOTDIR (alias for ensureDir — same function) → MUST try-catch
 *   - mkdirs throws EACCES, ENOTDIR (alias for ensureDir — same function) → MUST try-catch
 *   - createFile throws EACCES, ENOTDIR (alias for ensureFile — same function) → MUST try-catch
 *   - A try-catch wrapper (any catch block) satisfies the requirement
 *
 * Postcondition IDs from contract.yaml:
 *   readJson: file-not-found, invalid-json, permission-denied
 *   copy: source-not-found, permission-denied
 *   move: source-not-found, destination-exists, permission-denied
 *   outputFile: outputfile-permission-denied, outputfile-disk-full, outputfile-parent-dir-not-writable
 *   writeJson: writejson-parent-not-found, writejson-permission-denied, writejson-circular-reference
 *   ensureDir: ensuredir-permission-denied, ensuredir-path-component-is-file
 *   remove: remove-permission-denied, remove-path-too-long
 *   outputJson: outputjson-circular-reference, outputjson-permission-denied
 *   ensureFile: ensurefile-permission-denied, ensurefile-path-component-is-file
 *   mkdirp: mkdirp-permission-denied, mkdirp-path-component-is-file
 *   mkdirs: mkdirs-permission-denied, mkdirs-path-component-is-file
 *   createFile: createfile-permission-denied, createfile-path-component-is-file
 */

import * as fs from "fs-extra";
import fsExtra from "fs-extra";
import { readJson, copy, move, outputFile, writeJson, ensureDir, remove, outputJson, ensureFile, mkdirp, mkdirs, createFile } from "fs-extra";

// ─────────────────────────────────────────────────────────────────────────────
// 1. readJson — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function readJson_noCatch(p: string) {
  // SHOULD_FIRE: file-not-found — readJson throws ENOENT, no try-catch
  const data = await fs.readJson(p);
  return data;
}

export async function readJson_noCatch_defaultImport(p: string) {
  // SHOULD_FIRE: file-not-found — readJson via default import, no try-catch
  const data = await fsExtra.readJson(p);
  return data;
}

export async function readJson_noCatch_namedImport(p: string) {
  // SHOULD_FIRE: file-not-found — readJson via named import, no try-catch
  const data = await readJson(p);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. readJson — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function readJson_withCatch(p: string) {
  try {
    // SHOULD_NOT_FIRE: readJson is inside try-catch — file-not-found requirement satisfied
    const data = await fs.readJson(p);
    return data;
  } catch (err) {
    throw err;
  }
}

export async function readJson_withCatch_enoentCheck(p: string) {
  try {
    // SHOULD_NOT_FIRE: readJson with specific ENOENT handling — fully compliant
    const data = await fs.readJson(p);
    return data;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return {};
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. copy — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function copy_noCatch(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — copy throws ENOENT, no try-catch
  await fs.copy(src, dest);
}

export async function copy_noCatch_defaultImport(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — copy via default import, no try-catch
  await fsExtra.copy(src, dest);
}

export async function copy_noCatch_namedImport(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — copy via named import, no try-catch
  await copy(src, dest);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. copy — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function copy_withCatch(src: string, dest: string) {
  try {
    // SHOULD_NOT_FIRE: copy is inside try-catch — source-not-found requirement satisfied
    await fs.copy(src, dest);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. move — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function move_noCatch(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — move throws ENOENT, no try-catch
  await fs.move(src, dest);
}

export async function move_noCatch_withOverwrite(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — move with overwrite still throws ENOENT, no try-catch
  await fs.move(src, dest, { overwrite: true });
}

export async function move_noCatch_defaultImport(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — move via default import, no try-catch
  await fsExtra.move(src, dest);
}

export async function move_noCatch_namedImport(src: string, dest: string) {
  // SHOULD_FIRE: source-not-found — move via named import, no try-catch
  await move(src, dest);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. move — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function move_withCatch(src: string, dest: string) {
  try {
    // SHOULD_NOT_FIRE: move is inside try-catch — source-not-found requirement satisfied
    await fs.move(src, dest, { overwrite: true });
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. outputFile — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function outputFile_noCatch(file: string, data: string) {
  // SHOULD_FIRE: outputfile-permission-denied — outputFile calls fs.writeFile, no try-catch
  await fs.outputFile(file, data);
}

export async function outputFile_noCatch_namedImport(file: string, data: string) {
  // SHOULD_FIRE: outputfile-permission-denied — outputFile via named import, no try-catch
  await outputFile(file, data);
}

export async function outputFile_noCatch_defaultImport(file: string, data: string) {
  // SHOULD_FIRE: outputfile-permission-denied — outputFile via default import, no try-catch
  await fsExtra.outputFile(file, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. outputFile — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function outputFile_withCatch(file: string, data: string) {
  try {
    // SHOULD_NOT_FIRE: outputFile inside try-catch — outputfile-permission-denied satisfied
    await fs.outputFile(file, data);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. writeJson — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function writeJson_noCatch(file: string, data: object) {
  // SHOULD_FIRE: writejson-parent-not-found — writeJson throws ENOENT if parent missing, no try-catch
  await fs.writeJson(file, data);
}

export async function writeJson_noCatch_namedImport(file: string, data: object) {
  // SHOULD_FIRE: writejson-parent-not-found — writeJson via named import, no try-catch
  await writeJson(file, data);
}

export async function writeJson_noCatch_defaultImport(file: string, data: object) {
  // SHOULD_FIRE: writejson-parent-not-found — writeJson via default import, no try-catch
  await fsExtra.writeJson(file, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. writeJson — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function writeJson_withCatch(file: string, data: object) {
  try {
    // SHOULD_NOT_FIRE: writeJson inside try-catch — writejson-parent-not-found satisfied
    await fs.writeJson(file, data);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ensureDir — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureDir_noCatch(dir: string) {
  // SHOULD_FIRE: ensuredir-permission-denied — ensureDir throws EACCES, no try-catch
  await fs.ensureDir(dir);
}

export async function ensureDir_noCatch_namedImport(dir: string) {
  // SHOULD_FIRE: ensuredir-permission-denied — ensureDir via named import, no try-catch
  await ensureDir(dir);
}

export async function ensureDir_noCatch_mkdirp(dir: string) {
  // SHOULD_FIRE: mkdirp-permission-denied — mkdirp is now contracted (alias for ensureDir), no try-catch
  await fs.mkdirp(dir);
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. ensureDir — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureDir_withCatch(dir: string) {
  try {
    // SHOULD_NOT_FIRE: ensureDir inside try-catch — ensuredir-permission-denied satisfied
    await fs.ensureDir(dir);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. remove — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function remove_noCatch(path: string) {
  // SHOULD_FIRE: remove-permission-denied — remove throws EACCES even with force:true, no try-catch
  await fs.remove(path);
}

export async function remove_noCatch_namedImport(path: string) {
  // SHOULD_FIRE: remove-permission-denied — remove via named import, no try-catch
  await remove(path);
}

export async function remove_noCatch_defaultImport(path: string) {
  // SHOULD_FIRE: remove-permission-denied — remove via default import, no try-catch
  await fsExtra.remove(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. remove — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function remove_withCatch(path: string) {
  try {
    // SHOULD_NOT_FIRE: remove inside try-catch — remove-permission-denied satisfied
    await fs.remove(path);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. outputJson — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function outputJson_noCatch(file: string, data: object) {
  // SHOULD_FIRE: outputjson-circular-reference — outputJson throws EACCES, no try-catch (scanner fires first postcondition)
  await fs.outputJson(file, data);
}

export async function outputJson_noCatch_namedImport(file: string, data: object) {
  // SHOULD_FIRE: outputjson-circular-reference — outputJson via named import, no try-catch (scanner fires first postcondition)
  await outputJson(file, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. outputJson — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function outputJson_withCatch(file: string, data: object) {
  try {
    // SHOULD_NOT_FIRE: outputJson inside try-catch — outputjson-permission-denied satisfied
    await fs.outputJson(file, data);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. ensureFile — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureFile_noCatch(file: string) {
  // SHOULD_FIRE: ensurefile-permission-denied — ensureFile throws EACCES, no try-catch
  await fs.ensureFile(file);
}

export async function ensureFile_noCatch_namedImport(file: string) {
  // SHOULD_FIRE: ensurefile-permission-denied — ensureFile via named import, no try-catch
  await ensureFile(file);
}

export async function ensureFile_noCatch_createFile(file: string) {
  // SHOULD_FIRE: createfile-permission-denied — createFile is now contracted (alias for ensureFile), no try-catch
  await fs.createFile(file);
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. ensureFile — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureFile_withCatch(file: string) {
  try {
    // SHOULD_NOT_FIRE: ensureFile inside try-catch — ensurefile-permission-denied satisfied
    await fs.ensureFile(file);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. mkdirp — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mkdirp_noCatch(dir: string) {
  // SHOULD_FIRE: mkdirp-permission-denied — mkdirp throws EACCES (same as ensureDir), no try-catch
  await fs.mkdirp(dir);
}

export async function mkdirp_noCatch_namedImport(dir: string) {
  // SHOULD_FIRE: mkdirp-permission-denied — mkdirp via named import, no try-catch
  await mkdirp(dir);
}

export async function mkdirp_noCatch_defaultImport(dir: string) {
  // SHOULD_FIRE: mkdirp-permission-denied — mkdirp via default import, no try-catch
  await fsExtra.mkdirp(dir);
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. mkdirp — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function mkdirp_withCatch(dir: string) {
  try {
    // SHOULD_NOT_FIRE: mkdirp inside try-catch — mkdirp-permission-denied satisfied
    await fs.mkdirp(dir);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. mkdirs — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mkdirs_noCatch(dir: string) {
  // SHOULD_FIRE: mkdirs-permission-denied — mkdirs throws EACCES (same as ensureDir), no try-catch
  await fs.mkdirs(dir);
}

export async function mkdirs_noCatch_namedImport(dir: string) {
  // SHOULD_FIRE: mkdirs-permission-denied — mkdirs via named import, no try-catch
  await mkdirs(dir);
}

export async function mkdirs_noCatch_defaultImport(dir: string) {
  // SHOULD_FIRE: mkdirs-permission-denied — mkdirs via default import, no try-catch
  await fsExtra.mkdirs(dir);
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. mkdirs — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function mkdirs_withCatch(dir: string) {
  try {
    // SHOULD_NOT_FIRE: mkdirs inside try-catch — mkdirs-permission-denied satisfied
    await fs.mkdirs(dir);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. createFile — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function createFile_noCatch(file: string) {
  // SHOULD_FIRE: createfile-permission-denied — createFile throws EACCES (same as ensureFile), no try-catch
  await fs.createFile(file);
}

export async function createFile_noCatch_namedImport(file: string) {
  // SHOULD_FIRE: createfile-permission-denied — createFile via named import, no try-catch
  await createFile(file);
}

export async function createFile_noCatch_defaultImport(file: string) {
  // SHOULD_FIRE: createfile-permission-denied — createFile via default import, no try-catch
  await fsExtra.createFile(file);
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. createFile — with try-catch, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export async function createFile_withCatch(file: string) {
  try {
    // SHOULD_NOT_FIRE: createFile inside try-catch — createfile-permission-denied satisfied
    await fs.createFile(file);
  } catch (err) {
    throw err;
  }
}
