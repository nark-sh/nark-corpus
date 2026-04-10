/**
 * Instance-based usage patterns for vite.
 * Tests detection when vite is used via namespace import or class wrappers.
 */
import * as vite from 'vite';

/**
 * ❌ Using namespace import for build() without try-catch.
 * Should trigger ERROR violation.
 */
async function buildViaNamespace() {
  const result = await vite.build({
    root: './src',
  });
  return result;
}

/**
 * ❌ Using namespace import for createServer() without try-catch.
 * Should trigger ERROR violation.
 */
async function createServerViaNamespace() {
  const server = await vite.createServer({
    server: { port: 5173 },
  });
  await server.listen();
  return server;
}

/**
 * Wrapper class that calls vite APIs — missing error handling in methods.
 */
class ViteBuildRunner {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  /**
   * ❌ No try-catch — should trigger ERROR violation.
   */
  async build() {
    const result = await vite.build({
      root: this.rootDir,
    });
    return result;
  }

  /**
   * ✅ Correct — has try-catch, should NOT trigger violation.
   */
  async buildSafe() {
    try {
      const result = await vite.build({
        root: this.rootDir,
      });
      return result;
    } catch (error) {
      console.error('Build failed:', error);
      throw error;
    }
  }
}

/**
 * ❌ Missing error handling when vite.preview() is called via namespace.
 * Should trigger ERROR violation.
 */
async function previewViaNamespace() {
  const server = await vite.preview({
    preview: { port: 4173 },
  });
  server.printUrls();
}
