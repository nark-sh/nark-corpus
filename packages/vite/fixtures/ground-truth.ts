/**
 * vite Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the vite contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - build() without try-catch → SHOULD_FIRE: build-failure
 *   - createServer() without try-catch → SHOULD_FIRE: server-creation-failure
 *   - build() inside try-catch → SHOULD_NOT_FIRE
 *   - createServer() inside try-catch → SHOULD_NOT_FIRE
 *
 * Contracted postconditions:
 *   build-failure: build() throws RollupError on parse/import/plugin/config failure
 *   server-creation-failure: createServer() throws on port conflict, plugin error, or bad config
 *
 * Coverage:
 *   - Section 1: bare build() → SHOULD_FIRE
 *   - Section 2: build() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare createServer() → SHOULD_FIRE
 *   - Section 4: createServer() inside try-catch → SHOULD_NOT_FIRE
 */

import { build, createServer } from "vite";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare build() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function buildProductionNoCatch() {
  // SHOULD_FIRE: build-failure — build() without try-catch, RollupError unhandled
  await build({
    root: process.cwd(),
    build: {
      outDir: "dist",
    },
  });
}

export async function buildLibraryNoCatch(entry: string) {
  // SHOULD_FIRE: build-failure — build() without try-catch on library build
  const result = await build({
    build: {
      lib: {
        entry,
        name: "MyLib",
        formats: ["es", "cjs"],
      },
    },
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. build() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function buildProductionWithCatch() {
  try {
    // SHOULD_NOT_FIRE: build() inside try-catch satisfies the build-failure requirement
    await build({
      root: process.cwd(),
      build: {
        outDir: "dist",
      },
    });
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

export async function buildLibraryWithCatch(entry: string) {
  try {
    // SHOULD_NOT_FIRE: build() wrapped in try-catch
    const result = await build({
      build: {
        lib: {
          entry,
          name: "MyLib",
          formats: ["es", "cjs"],
        },
      },
    });
    return result;
  } catch (error) {
    console.error("Library build failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bare createServer() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function startDevServerNoCatch() {
  // SHOULD_FIRE: server-creation-failure — createServer() without try-catch, EADDRINUSE unhandled
  const server = await createServer({
    server: {
      port: 3000,
    },
  });
  await server.listen();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. createServer() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function startDevServerWithCatch() {
  let server;
  try {
    // SHOULD_NOT_FIRE: createServer() inside try-catch satisfies the server-creation-failure requirement
    server = await createServer({
      server: {
        port: 3000,
      },
    });
    await server.listen();
  } catch (error) {
    console.error("Failed to start dev server:", error);
    throw error;
  }
}
