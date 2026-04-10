/**
 * TypeScript Compiler API - Missing Error Handling Examples
 *
 * This file demonstrates INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations for unsafe file operations.
 */

import * as ts from 'typescript';

/**
 * Example 1: Reading file without error handling
 * ❌ No try-catch around ts.sys.readFile
 * Should trigger: file-not-found, permission-denied violations
 */
function readSourceFileUnsafe(filePath: string): string {
  // ❌ VIOLATION: ts.sys.readFile can throw ENOENT, EACCES
  const contents = ts.sys.readFile(filePath);
  return contents || '';
}

/**
 * Example 2: Reading directory without error handling
 * ❌ No try-catch around ts.sys.readDirectory
 * Should trigger: directory-not-found, permission-denied violations
 */
function scanTypescriptFilesUnsafe(dirPath: string): string[] {
  // ❌ VIOLATION: ts.sys.readDirectory can throw ENOENT, EACCES, ELOOP
  const files = ts.sys.readDirectory(
    dirPath,
    ['.ts', '.tsx'],
    undefined,
    undefined
  );
  return files;
}

/**
 * Example 3: Writing file without error handling
 * ❌ No try-catch around ts.sys.writeFile
 * Should trigger: permission-denied, directory-not-found violations
 */
function writeOutputFileUnsafe(filePath: string, content: string): void {
  // ❌ VIOLATION: ts.sys.writeFile can throw EACCES, ENOENT, ENOSPC, EROFS
  ts.sys.writeFile(filePath, content);
}

/**
 * Example 4: Multiple unsafe file operations
 * ❌ Multiple unhandled operations in sequence
 */
function processFilesUnsafe(inputDir: string, outputDir: string): void {
  // ❌ VIOLATION: readDirectory without try-catch
  const files = ts.sys.readDirectory(inputDir, ['.ts']);

  for (const file of files) {
    // ❌ VIOLATION: readFile without try-catch
    const content = ts.sys.readFile(file);

    if (content) {
      const outputPath = file.replace(inputDir, outputDir);
      // ❌ VIOLATION: writeFile without try-catch
      ts.sys.writeFile(outputPath, content.toUpperCase());
    }
  }
}

/**
 * Example 5: Creating program without checking diagnostics
 * ⚠️ WARNING: Should check diagnostics after program creation
 */
function createProgramWithoutDiagnosticCheck(
  fileNames: string[],
  options: ts.CompilerOptions
) {
  const program = ts.createProgram(fileNames, options);

  // ⚠️ WARNING: No diagnostic check before emitting
  // Should call ts.getPreEmitDiagnostics(program)

  return program;
}

/**
 * Example 6: Emitting without checking diagnostics
 * ⚠️ WARNING: Should check emit result
 */
function emitWithoutDiagnosticCheck(
  fileNames: string[],
  options: ts.CompilerOptions
): void {
  const program = ts.createProgram(fileNames, options);

  // ⚠️ WARNING: Emitting without checking diagnostics
  program.emit();

  // No check for emitResult.diagnostics or emitSkipped
}

/**
 * Example 7: Custom compiler host without error handling
 * ❌ getSourceFile doesn't handle errors
 */
function createUnsafeCompilerHost(): ts.CompilerHost {
  const defaultHost = ts.createCompilerHost({});

  return {
    ...defaultHost,
    getSourceFile: (fileName, languageVersion) => {
      // ❌ VIOLATION: ts.sys.readFile without try-catch
      const sourceText = ts.sys.readFile(fileName);
      if (sourceText === undefined) {
        return undefined;
      }
      return ts.createSourceFile(fileName, sourceText, languageVersion);
    }
  };
}

/**
 * Example 8: Nested unsafe operations
 * ❌ Multiple levels of unsafe file operations
 */
class UnsafeCompiler {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  compile(): void {
    // ❌ VIOLATION: readDirectory without try-catch
    const files = ts.sys.readDirectory(this.rootDir, ['.ts']);

    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    };

    const program = ts.createProgram(files, options);

    // ⚠️ WARNING: No diagnostic check
    const emitResult = program.emit();

    // Even if we check emitSkipped, still missing file operation error handling
    if (!emitResult.emitSkipped) {
      console.log('Compilation successful');
    }
  }

  readConfig(configPath: string): ts.CompilerOptions {
    // ❌ VIOLATION: readFile without try-catch
    const configText = ts.sys.readFile(configPath);
    return JSON.parse(configText || '{}');
  }
}

/**
 * Example 9: Utility function with unsafe file access
 * ❌ No error handling in helper function
 */
function getTsFiles(dir: string): string[] {
  // ❌ VIOLATION: This is exactly the pattern found in Next.js
  return ts.sys.readDirectory(dir);
}

/**
 * Example 10: Language service host without error handling
 * ❌ Multiple unsafe operations in host implementation
 */
function createLanguageServiceHost(dir: string): ts.LanguageServiceHost {
  // ❌ VIOLATION: readDirectory without try-catch
  const files = ts.sys.readDirectory(dir);
  const compilerOptions = ts.getDefaultCompilerOptions();
  const compilerHost = ts.createCompilerHost(compilerOptions);

  return {
    ...compilerHost,
    getCompilationSettings: () => compilerOptions,
    getScriptFileNames: () => files,
    getScriptSnapshot: (fileName) => {
      // ❌ VIOLATION: readFile without try-catch
      const contents = ts.sys.readFile(fileName);
      if (contents && typeof contents === 'string') {
        return ts.ScriptSnapshot.fromString(contents);
      }
      return undefined;
    },
    getScriptVersion: () => '0',
    writeFile: ts.sys.writeFile, // ❌ Direct reference, inherits unsafe behavior
  };
}

// Export for testing
export {
  readSourceFileUnsafe,
  scanTypescriptFilesUnsafe,
  writeOutputFileUnsafe,
  processFilesUnsafe,
  createProgramWithoutDiagnosticCheck,
  emitWithoutDiagnosticCheck,
  createUnsafeCompilerHost,
  UnsafeCompiler,
  getTsFiles,
  createLanguageServiceHost,
};
