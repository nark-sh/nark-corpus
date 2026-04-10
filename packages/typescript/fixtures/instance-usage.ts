/**
 * TypeScript Compiler API - Instance and Namespace Usage Testing
 *
 * This file tests detection of TypeScript API usage through different patterns:
 * - Direct namespace access (ts.sys.*)
 * - Aliased imports
 * - Object destructuring
 *
 * Should trigger violations where appropriate.
 */

import * as ts from 'typescript';
import * as typescript from 'typescript';

/**
 * Example 1: Direct namespace access
 * ❌ Should detect ts.sys.* calls
 */
function directNamespaceAccess(filePath: string): string | undefined {
  // ❌ VIOLATION: Direct ts.sys.readFile call
  return ts.sys.readFile(filePath);
}

/**
 * Example 2: Aliased import
 * ❌ Should detect typescript.sys.* calls
 */
function aliasedImport(filePath: string): string | undefined {
  // ❌ VIOLATION: Aliased typescript.sys.readFile call
  return typescript.sys.readFile(filePath);
}

/**
 * Example 3: Destructured sys object
 * ❌ Should detect destructured sys operations
 */
function destructuredSys(dirPath: string): string[] {
  const { sys } = ts;
  // ❌ VIOLATION: sys.readDirectory via destructuring
  return sys.readDirectory(dirPath);
}

/**
 * Example 4: Sys object stored in variable
 * ❌ Should detect sys variable usage
 */
function sysVariable(filePath: string): void {
  const sys = ts.sys;
  const content = 'test content';
  // ❌ VIOLATION: sys.writeFile via variable
  sys.writeFile(filePath, content);
}

/**
 * Example 5: Method references passed as callbacks
 * ❌ Should detect when sys methods are passed around
 */
function methodReferences(files: string[]): void {
  // ❌ VIOLATION: sys.readFile passed as callback
  const contents = files.map(ts.sys.readFile);
  console.log(contents.length);
}

/**
 * Example 6: Nested namespace access in object literals
 * ❌ Should detect nested sys usage
 */
function nestedNamespaceAccess(dir: string): ts.LanguageServiceHost {
  const files = ts.sys.readDirectory(dir); // ❌ VIOLATION

  return {
    getCompilationSettings: () => ts.getDefaultCompilerOptions(),
    getScriptFileNames: () => files,
    getScriptSnapshot: (fileName) => {
      // ❌ VIOLATION: Nested in object literal
      const contents = ts.sys.readFile(fileName);
      return contents ? ts.ScriptSnapshot.fromString(contents) : undefined;
    },
    getScriptVersion: () => '0',
    writeFile: ts.sys.writeFile, // ❌ VIOLATION: Direct reference
  } as ts.LanguageServiceHost;
}

/**
 * Example 7: Conditional sys access
 * ❌ Should detect sys calls in conditionals
 */
function conditionalSysAccess(filePath: string, shouldRead: boolean): string | undefined {
  if (shouldRead) {
    // ❌ VIOLATION: Inside conditional
    return ts.sys.readFile(filePath);
  }
  return undefined;
}

/**
 * Example 8: Loop with sys operations
 * ❌ Should detect sys calls in loops
 */
function loopSysAccess(filePaths: string[]): void {
  for (const filePath of filePaths) {
    // ❌ VIOLATION: Inside loop
    const content = ts.sys.readFile(filePath);
    if (content) {
      console.log(content.length);
    }
  }
}

/**
 * Example 9: Class with sys operations
 * ❌ Should detect sys calls in class methods
 */
class FileProcessor {
  processFile(filePath: string): void {
    // ❌ VIOLATION: In class method
    const content = ts.sys.readFile(filePath);
    console.log(content);
  }

  processDirectory(dirPath: string): void {
    // ❌ VIOLATION: In class method
    const files = ts.sys.readDirectory(dirPath);
    files.forEach(file => this.processFile(file));
  }

  writeProcessed(filePath: string, content: string): void {
    // ❌ VIOLATION: In class method
    ts.sys.writeFile(filePath, content);
  }
}

/**
 * Example 10: Arrow functions with sys operations
 * ❌ Should detect sys calls in arrow functions
 */
const arrowFunctionSys = (filePath: string) => {
  // ❌ VIOLATION: In arrow function
  return ts.sys.readFile(filePath);
};

const arrowFunctionSysDirectory = (dirPath: string) => {
  // ❌ VIOLATION: In arrow function
  return ts.sys.readDirectory(dirPath);
};

/**
 * Example 11: IIFE with sys operations
 * ❌ Should detect sys calls in IIFE
 */
const filesFromIIFE = (() => {
  const dir = process.cwd();
  // ❌ VIOLATION: In IIFE
  return ts.sys.readDirectory(dir);
})();

/**
 * Example 12: Mixed safe and unsafe operations
 * ✅ Some with try-catch, ❌ some without
 */
function mixedSafetyOperations(file1: string, file2: string): void {
  // ✅ Safe: Has try-catch
  try {
    const content1 = ts.sys.readFile(file1);
    console.log(content1);
  } catch (error) {
    console.error('Error reading file1', error);
  }

  // ❌ VIOLATION: No try-catch
  const content2 = ts.sys.readFile(file2);
  console.log(content2);
}

/**
 * Example 13: Chained sys operations
 * ❌ Should detect all sys calls in chain
 */
function chainedSysOperations(inputDir: string, outputDir: string): void {
  // ❌ VIOLATION: readDirectory
  ts.sys.readDirectory(inputDir)
    .filter(f => f.endsWith('.ts'))
    .forEach(file => {
      // ❌ VIOLATION: readFile in forEach
      const content = ts.sys.readFile(file);
      if (content) {
        const outputPath = file.replace(inputDir, outputDir);
        // ❌ VIOLATION: writeFile in forEach
        ts.sys.writeFile(outputPath, content);
      }
    });
}

/**
 * Example 14: Async function with sys operations
 * ❌ Even in async context, sync sys calls need error handling
 */
async function asyncWithSysOperations(filePath: string): Promise<void> {
  // ❌ VIOLATION: sync ts.sys.readFile in async function still needs try-catch
  const content = ts.sys.readFile(filePath);
  console.log(content);
}

/**
 * Example 15: Generator function with sys operations
 * ❌ Should detect sys calls in generators
 */
function* fileGenerator(dirPath: string): Generator<string> {
  // ❌ VIOLATION: In generator function
  const files = ts.sys.readDirectory(dirPath);
  for (const file of files) {
    // ❌ VIOLATION: In generator function
    yield ts.sys.readFile(file) || '';
  }
}

// Export for testing
export {
  directNamespaceAccess,
  aliasedImport,
  destructuredSys,
  sysVariable,
  methodReferences,
  nestedNamespaceAccess,
  conditionalSysAccess,
  loopSysAccess,
  FileProcessor,
  arrowFunctionSys,
  arrowFunctionSysDirectory,
  filesFromIIFE,
  mixedSafetyOperations,
  chainedSysOperations,
  asyncWithSysOperations,
  fileGenerator,
};
