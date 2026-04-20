/**
 * Mocha Ground-Truth Fixtures
 *
 * Tests for programmatic Mocha API (Mocha class) usage patterns.
 * Annotations indicate which postcondition each function should violate.
 *
 * New postconditions from depth pass 2026-04-20:
 *   - load-files-async-syntax-error
 *   - load-files-async-module-not-found
 *   - load-files-async-unknown-extension
 *   - run-already-running-throws
 *   - run-silent-failure-no-callback
 */

import Mocha from 'mocha';

// ---------------------------------------------------------------------------
// Mocha.loadFilesAsync() — VIOLATIONS
// ---------------------------------------------------------------------------

// @expect-violation: load-files-async-syntax-error
// @expect-violation: load-files-async-module-not-found
// @expect-violation: load-files-async-unknown-extension
async function runTestsWithoutLoadErrorHandling() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  // ❌ No .catch() — loadFilesAsync rejection crashes the process
  await mocha.loadFilesAsync();
  mocha.run(failures => { process.exitCode = failures ? 1 : 0; });
}

// @expect-clean
async function runTestsWithLoadErrorHandling() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  try {
    // ✅ Catches file-load errors (SyntaxError, ERR_MODULE_NOT_FOUND, etc.)
    await mocha.loadFilesAsync();
    mocha.run(failures => { process.exitCode = failures ? 1 : 0; });
  } catch (err) {
    console.error('Failed to load test files:', err);
    process.exitCode = 1;
  }
}

// @expect-clean
async function runTestsWithCatchChain() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  // ✅ .catch() chain handles all load failures
  mocha.loadFilesAsync()
    .then(() => mocha.run(failures => { process.exitCode = failures ? 1 : 0; }))
    .catch(err => {
      console.error('Test file load failed:', err);
      process.exitCode = 1;
    });
}

// ---------------------------------------------------------------------------
// Mocha.run() — VIOLATIONS
// ---------------------------------------------------------------------------

// @expect-violation: run-silent-failure-no-callback
async function runTestsWithoutFailureCheck() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  try {
    await mocha.loadFilesAsync();
  } catch (err) {
    process.exitCode = 1;
    return;
  }

  // ❌ No callback — test failures silently swallowed, process exits 0 on failure
  mocha.run();
}

// @expect-violation: run-silent-failure-no-callback
async function runTestsWithEmptyCallback() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  try {
    await mocha.loadFilesAsync();
  } catch (err) {
    process.exitCode = 1;
    return;
  }

  // ❌ Callback provided but failures count not checked — same silent failure
  mocha.run(() => {
    // does nothing with failures
    console.log('Tests done');
  });
}

// @expect-clean
async function runTestsWithProperFailureCheck() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  try {
    await mocha.loadFilesAsync();
  } catch (err) {
    console.error('Load failed:', err);
    process.exitCode = 1;
    return;
  }

  // ✅ Callback checks failures and sets exit code appropriately
  mocha.run(failures => {
    process.exitCode = failures ? 1 : 0;
  });
}

// @expect-clean
async function runTestsWithExplicitExit() {
  const mocha = new Mocha();
  mocha.addFile('./test/suite.test.ts');

  try {
    await mocha.loadFilesAsync();
  } catch (err) {
    console.error('Load failed:', err);
    process.exit(1);
  }

  // ✅ Uses process.exit() to ensure CI sees failure
  mocha.run(failures => {
    if (failures > 0) {
      console.error(`${failures} test(s) failed`);
      process.exit(1);
    }
    process.exit(0);
  });
}
