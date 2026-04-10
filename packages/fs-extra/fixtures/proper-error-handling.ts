/**
 * fs-extra: Proper Error Handling Fixture
 *
 * Demonstrates CORRECT error handling for fs-extra async functions.
 * Should NOT trigger any violations.
 */

import * as fs from "fs-extra";

// ─────────────────────────────────────────────────────────────────────────────
// readJson — proper handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper: try-catch around readJson handles both ENOENT and SyntaxError.
 */
async function loadConfig(configPath: string) {
  try {
    const config = await fs.readJson(configPath);
    return config;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.warn("Config file not found, using defaults");
      return {};
    }
    throw error;
  }
}

/**
 * Proper: try-catch around readJson with generic catch is sufficient.
 */
async function loadPackageJson(pkgPath: string) {
  try {
    const pkg = await fs.readJson(pkgPath);
    return pkg;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// copy — proper handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper: try-catch around copy handles ENOENT and EACCES.
 */
async function safeCopy(src: string, dest: string) {
  try {
    await fs.copy(src, dest);
  } catch (error: any) {
    console.error("Copy failed:", error.message);
    throw error;
  }
}

/**
 * Proper: try-catch with ENOENT check.
 */
async function copyIfExists(src: string, dest: string) {
  try {
    await fs.copy(src, dest);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// move — proper handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper: try-catch around move with overwrite option.
 */
async function safeMove(src: string, dest: string) {
  try {
    await fs.move(src, dest, { overwrite: true });
  } catch (error: any) {
    console.error("Move failed:", error.message);
    throw error;
  }
}

/**
 * Proper: try-catch around move without overwrite (handles dest-exists error).
 */
async function safeMoveNoOverwrite(src: string, dest: string) {
  try {
    await fs.move(src, dest);
  } catch (err) {
    throw err;
  }
}
