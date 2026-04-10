/**
 * Proper error handling patterns for vite programmatic API.
 * This file should produce 0 violations.
 */
import { build, createServer, preview } from 'vite';

/**
 * Correct: build() wrapped in try/catch.
 * Should NOT trigger any violations.
 */
async function buildProductionWithErrorHandling() {
  try {
    const result = await build({
      root: './src',
      build: {
        outDir: '../dist',
      },
    });
    console.log('Build succeeded');
    return result;
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

/**
 * Correct: build() with .catch() handler.
 * Should NOT trigger any violations.
 */
function buildWithCatchHandler() {
  return build({ root: './src' }).catch((error) => {
    console.error('Build failed:', error);
    throw error;
  });
}

/**
 * Correct: createServer() wrapped in try/catch with cleanup.
 * Should NOT trigger any violations.
 */
async function startDevServerWithErrorHandling() {
  let server;
  try {
    server = await createServer({
      root: './src',
      server: {
        port: 5173,
      },
    });
    await server.listen();
    server.printUrls();
  } catch (error) {
    console.error('Dev server failed to start:', error);
    await server?.close();
    process.exit(1);
  }

  process.on('SIGTERM', async () => {
    await server?.close();
  });

  return server;
}

/**
 * Correct: preview() wrapped in try/catch.
 * Should NOT trigger any violations.
 */
async function startPreviewServerWithErrorHandling() {
  let server;
  try {
    server = await preview({
      preview: {
        port: 4173,
      },
    });
    server.printUrls();
  } catch (error) {
    console.error('Preview server failed:', error);
    await server?.close();
    process.exit(1);
  }

  return server;
}

/**
 * Correct: Sequential builds with error handling for SSR setup.
 * Should NOT trigger any violations.
 */
async function buildSSRWithErrorHandling() {
  try {
    await build({ build: { outDir: 'dist/client' } });
  } catch (error) {
    console.error('Client build failed:', error);
    throw error;
  }

  try {
    await build({
      build: { outDir: 'dist/server', ssr: true },
    });
  } catch (error) {
    console.error('SSR build failed:', error);
    throw error;
  }
}
