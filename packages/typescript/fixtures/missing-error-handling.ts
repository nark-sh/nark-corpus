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

/**
 * Example 11: ts.transform() with custom transformer, no try-catch
 * ❌ Should trigger: transform-custom-transformer-throws,
 *                    transform-result-not-disposed
 *
 * Custom transformers can crash inside the visitor loop. ts.transform()
 * has no internal catch, so the exception terminates the call.
 */
// @expect-violation: transform-custom-transformer-throws
// @expect-violation: transform-result-not-disposed
function applyTransformerUnsafe(
  source: ts.SourceFile,
  transformer: ts.TransformerFactory<ts.SourceFile>
): ts.SourceFile {
  // ❌ VIOLATION: no try/catch, no dispose() call
  const result = ts.transform(source, [transformer]);
  return result.transformed[0];
}

/**
 * Example 12: ts.findConfigFile() result used without nullish check
 * ❌ Should trigger: findconfigfile-undefined-result-not-checked
 *
 * findConfigFile returns undefined when no tsconfig.json is found in any
 * ancestor directory. Passing the result directly to readConfigFile() or
 * path.dirname() crashes with TypeError on the miss case.
 */
// @expect-violation: findconfigfile-undefined-result-not-checked
function loadConfigUnsafe(searchPath: string) {
  // ❌ VIOLATION: configPath may be undefined; readConfigFile crashes
  const configPath = ts.findConfigFile(searchPath, ts.sys.fileExists);
  const { config } = ts.readConfigFile(configPath!, ts.sys.readFile);
  return config;
}

/**
 * Example 13: getParsedCommandLineOfConfigFile result used without check
 * ❌ Should trigger: getparsedcommandline-undefined-not-checked
 *
 * Returns undefined when readFile fails. Calling .options on undefined
 * crashes the build pipeline silently.
 */
// @expect-violation: getparsedcommandline-undefined-not-checked
function parseConfigUnsafe(configFileName: string, host: ts.ParseConfigFileHost) {
  // ❌ VIOLATION: parsed could be undefined
  const parsed = ts.getParsedCommandLineOfConfigFile(configFileName, undefined, host);
  return ts.createProgram(parsed!.fileNames, parsed!.options);
}

/**
 * Example 14: getParsedCommandLineOfConfigFile with bare ts.sys spread
 * ❌ Should trigger: getparsedcommandline-host-missing-callback
 *
 * ts.sys is a System, not a ParseConfigFileHost — it does NOT define
 * onUnRecoverableConfigFileDiagnostic. Any read failure raises TypeError.
 */
// @expect-violation: getparsedcommandline-host-missing-callback
function parseConfigUnsafeHost(configFileName: string) {
  // ❌ VIOLATION: host is missing onUnRecoverableConfigFileDiagnostic
  const host = { ...ts.sys } as ts.ParseConfigFileHost;
  return ts.getParsedCommandLineOfConfigFile(configFileName, undefined, host);
}

/**
 * Example 15: convertCompilerOptionsFromJson result.errors ignored
 * ❌ Should trigger: convertcompileroptions-errors-not-checked
 *
 * Invalid option values (typos, wrong-type values) accumulate in errors[]
 * while options[] silently falls back to defaults — the compilation
 * proceeds with the wrong settings.
 */
// @expect-violation: convertcompileroptions-errors-not-checked
function convertOptionsUnsafe(jsonOptions: unknown, basePath: string) {
  // ❌ VIOLATION: result.errors silently dropped
  const { options } = ts.convertCompilerOptionsFromJson(jsonOptions, basePath);
  return options;
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
  applyTransformerUnsafe,
  loadConfigUnsafe,
  parseConfigUnsafe,
  parseConfigUnsafeHost,
  convertOptionsUnsafe,
};
