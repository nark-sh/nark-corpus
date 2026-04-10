/**
 * fs-extra: Instance/Alias Usage Fixture
 *
 * Tests detection via aliased and named imports.
 * Should trigger violations for unprotected calls.
 */

import fsExtra from "fs-extra";
import { readJson, copy, move } from "fs-extra";

// ─────────────────────────────────────────────────────────────────────────────
// Default import alias — bad patterns
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bad: aliased default import, no try-catch on readJson.
 */
async function loadWithAlias(configPath: string) {
  const config = await fsExtra.readJson(configPath);
  return config;
}

/**
 * Bad: aliased default import, no try-catch on copy.
 */
async function copyWithAlias(src: string, dest: string) {
  await fsExtra.copy(src, dest);
}

/**
 * Bad: aliased default import, no try-catch on move.
 */
async function moveWithAlias(src: string, dest: string) {
  await fsExtra.move(src, dest);
}

// ─────────────────────────────────────────────────────────────────────────────
// Named imports — bad patterns
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bad: named import readJson, no try-catch.
 */
async function copyWithNamedImport(src: string, dest: string) {
  await copy(src, dest);
}

/**
 * Bad: named import move, no try-catch.
 */
async function moveWithNamedImport(src: string, dest: string) {
  await move(src, dest);
}

// ─────────────────────────────────────────────────────────────────────────────
// Default import alias — good patterns (with try-catch)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Good: aliased default import with try-catch.
 */
async function loadWithAliasSafe(configPath: string) {
  try {
    const config = await fsExtra.readJson(configPath);
    return config;
  } catch (err) {
    throw err;
  }
}

/**
 * Good: named import with try-catch.
 */
async function copyWithNamedImportSafe(src: string, dest: string) {
  try {
    await copy(src, dest);
  } catch (err) {
    throw err;
  }
}
