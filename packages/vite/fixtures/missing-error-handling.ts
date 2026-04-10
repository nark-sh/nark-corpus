/**
 * Missing error handling patterns for vite programmatic API.
 * This file should produce multiple ERROR violations.
 */
import { build, createServer, preview } from 'vite';

/**
 * ❌ Missing try-catch around build().
 * Should trigger ERROR violation: build-failure postcondition.
 */
async function buildProductionMissingErrorHandling() {
  const result = await build({
    root: './src',
    build: {
      outDir: '../dist',
    },
  });
  return result;
}

/**
 * ❌ Missing try-catch around createServer().
 * Should trigger ERROR violation: server-creation-failure postcondition.
 */
async function startDevServerMissingErrorHandling() {
  const server = await createServer({
    root: './src',
    server: {
      port: 5173,
    },
  });
  await server.listen();
  server.printUrls();
  return server;
}

/**
 * ❌ Missing try-catch around preview().
 * Should trigger ERROR violation: preview-server-failure postcondition.
 */
async function startPreviewServerMissingErrorHandling() {
  const server = await preview({
    preview: {
      port: 4173,
    },
  });
  server.printUrls();
  return server;
}

/**
 * ❌ Build without any error handling in a build pipeline.
 * This is the most common antipattern in CI build scripts.
 * Should trigger ERROR violation.
 */
async function runBuildPipeline() {
  // Client build — no error handling
  await build({ build: { outDir: 'dist/client' } });

  // SSR build — no error handling
  await build({ build: { outDir: 'dist/server', ssr: true } });

  console.log('Pipeline complete');
}
