/**
 * fs-extra: Missing Error Handling Fixture
 *
 * Demonstrates INCORRECT error handling for fs-extra async functions.
 * Should trigger ERROR violations for each unprotected call.
 */

import * as fs from "fs-extra";

// ─────────────────────────────────────────────────────────────────────────────
// readJson — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bad: no try-catch on readJson — throws ENOENT or SyntaxError unhandled.
 */
async function loadConfigBad(configPath: string) {
  const config = await fs.readJson(configPath);
  return config;
}

/**
 * Bad: no try-catch on readJson — common in build scripts.
 */
async function readPackageJsonBad(pkgPath: string) {
  const pkg = await fs.readJson(pkgPath);
  return pkg.version;
}

// ─────────────────────────────────────────────────────────────────────────────
// copy — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bad: no try-catch on copy — throws ENOENT if source doesn't exist.
 */
async function copyFilesBad(src: string, dest: string) {
  await fs.copy(src, dest);
}

/**
 * Bad: no try-catch on copy — common in deployment scripts.
 */
async function deployAssets(srcDir: string, destDir: string) {
  await fs.copy(srcDir, destDir);
  console.log("Assets deployed");
}

// ─────────────────────────────────────────────────────────────────────────────
// move — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bad: no try-catch on move — throws ENOENT or "dest already exists".
 */
async function moveFilesBad(src: string, dest: string) {
  await fs.move(src, dest);
}

/**
 * Bad: no try-catch on move — move with overwrite still throws ENOENT.
 */
async function moveWithOverwriteBad(src: string, dest: string) {
  await fs.move(src, dest, { overwrite: true });
}
