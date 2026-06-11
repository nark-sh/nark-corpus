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
 *   - server.listen() without try-catch → SHOULD_FIRE: server-listen-port-conflict
 *   - server.close() not awaited → SHOULD_FIRE: server-close-not-awaited
 *   - server.restart() without try-catch → SHOULD_FIRE: server-restart-port-conflict
 *   - resolveConfig() without try-catch → SHOULD_FIRE: resolveconfig-config-hook-throws
 *   - loadConfigFromFile() without try-catch → SHOULD_FIRE: loadconfig-not-an-object
 *   - createBuilder() without try-catch → SHOULD_FIRE: createbuilder-config-resolution-failure
 *   - transformWithOxc() without try-catch → SHOULD_FIRE: transformwithoxc-parse-error
 *   - build() inside try-catch → SHOULD_NOT_FIRE
 *   - createServer() inside try-catch → SHOULD_NOT_FIRE
 *
 * Contracted postconditions (Phase 1 — original):
 *   build-failure: build() throws RollupError on parse/import/plugin/config failure
 *   server-creation-failure: createServer() throws on port conflict, plugin error, or bad config
 *
 * Contracted postconditions (Phase 2 — depth pass 2026-04-18):
 *   server-listen-middleware-mode-forbidden: server.listen() throws in middleware mode
 *   server-listen-port-conflict: server.listen() throws when port is in use + strictPort
 *   server-close-not-awaited: server.close() not awaited before process exit
 *   server-restart-port-conflict: server.restart() throws on port conflict during restart
 *   resolveconfig-config-hook-throws: resolveConfig() throws when plugin config hook throws
 *   resolveconfig-environments-stripped: resolveConfig() throws when plugin removes environments
 *   loadconfig-invalid-loader: loadConfigFromFile() throws on invalid configLoader value
 *   loadconfig-not-an-object: loadConfigFromFile() throws when config export is not an object
 *   loadconfig-esm-only-dependency: loadConfigFromFile() throws on ESM-only package in CJS config
 *   loadconfig-tsx-jiti-missing: loadConfigFromFile() throws when tsx/jiti missing in runner mode
 *   createbuilder-config-resolution-failure: createBuilder() throws on config errors
 *   createbuilder-environment-init-failure: createBuilder() throws on environment init failure
 *   transformwithoxc-parse-error: transformWithOxc() throws on syntax errors
 */

import { build, createServer, resolveConfig, loadConfigFromFile, createBuilder, transformWithOxc } from "vite";

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

// ─────────────────────────────────────────────────────────────────────────────
// 5. server.listen() — no try-catch → SHOULD_FIRE (depth pass 2026-04-18)
// ─────────────────────────────────────────────────────────────────────────────

export async function listenNoCatch() {
  const server = await createServer({ server: { port: 3001, strictPort: true } });
  // SHOULD_FIRE: server-listen-port-conflict — server.listen() without try-catch; if port 3001 is in use, throws Error("Port 3001 is already in use")
  await server.listen();
}

export async function listenWithCatch() {
  let server;
  try {
    server = await createServer({ server: { port: 3001 } });
    // SHOULD_NOT_FIRE: server.listen() inside try-catch
    await server.listen();
  } catch (error) {
    console.error("Server listen failed:", error);
    if (server) await server.close();
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. server.restart() — no try-catch → SHOULD_FIRE (depth pass 2026-04-18)
// ─────────────────────────────────────────────────────────────────────────────

export async function restartNoCatch(server: Awaited<ReturnType<typeof createServer>>) {
  // SHOULD_FIRE: server-restart-port-conflict — server.restart() without try-catch; if restart fails due to port conflict, throws and server is left in closed state
  await server.restart();
}

export async function restartWithCatch(server: Awaited<ReturnType<typeof createServer>>) {
  try {
    // SHOULD_NOT_FIRE: server.restart() inside try-catch
    await server.restart();
  } catch (error) {
    console.error("Server restart failed:", error);
    // Recovery: server is closed at this point, start fresh
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. resolveConfig() — no try-catch → SHOULD_FIRE (depth pass 2026-04-18)
// ─────────────────────────────────────────────────────────────────────────────

export async function resolveConfigNoCatch() {
  // SHOULD_FIRE: resolveconfig-config-hook-throws — resolveConfig() without try-catch; if a plugin config hook throws, the error propagates unhandled
  const resolved = await resolveConfig({}, "build");
  return resolved;
}

export async function resolveConfigWithCatch() {
  try {
    // SHOULD_NOT_FIRE: resolveConfig() inside try-catch
    const resolved = await resolveConfig({}, "build");
    return resolved;
  } catch (error) {
    console.error("Config resolution failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. loadConfigFromFile() — no try-catch → SHOULD_FIRE (depth pass 2026-04-18)
// ─────────────────────────────────────────────────────────────────────────────

export async function loadConfigNoCatch() {
  // SHOULD_FIRE: loadconfig-not-an-object — loadConfigFromFile() without try-catch; throws if config file exports a non-object (e.g., a string or number)
  const result = await loadConfigFromFile({ mode: "development", command: "build", isSsrBuild: false, isPreview: false });
  return result;
}

export async function loadConfigWithCatch() {
  try {
    // SHOULD_NOT_FIRE: loadConfigFromFile() inside try-catch
    const result = await loadConfigFromFile({ mode: "development", command: "build", isSsrBuild: false, isPreview: false });
    return result;
  } catch (error) {
    console.error("Config file load failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. createBuilder() — no try-catch → SHOULD_FIRE (depth pass 2026-04-18)
// ─────────────────────────────────────────────────────────────────────────────

export async function createBuilderNoCatch() {
  // SHOULD_FIRE: createbuilder-config-resolution-failure — createBuilder() without try-catch; if config has errors or environment init fails, throws unhandled
  const builder = await createBuilder({});
  return builder;
}

export async function createBuilderWithCatch() {
  try {
    // SHOULD_NOT_FIRE: createBuilder() inside try-catch
    const builder = await createBuilder({});
    return builder;
  } catch (error) {
    console.error("Builder creation failed:", error);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. transformWithOxc() — no try-catch → SHOULD_FIRE (depth pass 2026-04-18)
// ─────────────────────────────────────────────────────────────────────────────

export async function transformCodeNoCatch(code: string, filename: string) {
  // SHOULD_FIRE: transformwithoxc-parse-error — transformWithOxc() without try-catch; if code has syntax errors, throws Error("Transform failed with N error(s):...") with .errors array containing OxcTransformError objects
  const result = await transformWithOxc(code, filename, {});
  return result;
}

export async function transformCodeWithCatch(code: string, filename: string) {
  try {
    // SHOULD_NOT_FIRE: transformWithOxc() inside try-catch
    const result = await transformWithOxc(code, filename, {});
    return result;
  } catch (error) {
    console.error("Transform failed:", error);
    // Access error.errors array for per-error details
    throw error;
  }
}
