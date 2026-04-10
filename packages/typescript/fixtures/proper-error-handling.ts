/**
 * TypeScript Compiler API - Proper Error Handling Examples
 *
 * This file demonstrates CORRECT error handling for TypeScript Compiler API operations.
 * Should NOT trigger any violations.
 */

import * as ts from 'typescript';
import * as path from 'path';

/**
 * Example 1: Reading a file with proper error handling
 * ✅ Wraps ts.sys.readFile in try-catch
 */
function readSourceFileSafely(filePath: string): string | null {
  try {
    const contents = ts.sys.readFile(filePath);
    if (contents === undefined) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
    return contents;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
    return null;
  }
}

/**
 * Example 2: Reading directory with proper error handling
 * ✅ Wraps ts.sys.readDirectory in try-catch
 */
function scanTypescriptFilesSafely(dirPath: string): string[] {
  try {
    const files = ts.sys.readDirectory(
      dirPath,
      ['.ts', '.tsx'],
      undefined,
      undefined
    );
    return files;
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        console.error(`Directory not found: ${dirPath}`);
      } else if ('code' in error && error.code === 'EACCES') {
        console.error(`Permission denied for directory: ${dirPath}`);
      } else {
        console.error(`Error reading directory ${dirPath}:`, error.message);
      }
    }
    return [];
  }
}

/**
 * Example 3: Writing file with proper error handling
 * ✅ Wraps ts.sys.writeFile in try-catch
 */
function writeOutputFileSafely(filePath: string, content: string): boolean {
  try {
    ts.sys.writeFile(filePath, content);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error) {
        const errorCode = (error as any).code;
        switch (errorCode) {
          case 'ENOENT':
            console.error(`Directory does not exist for file: ${filePath}`);
            break;
          case 'EACCES':
            console.error(`Permission denied writing to: ${filePath}`);
            break;
          case 'ENOSPC':
            console.error(`No space left on device for: ${filePath}`);
            break;
          default:
            console.error(`Error writing file ${filePath}:`, error.message);
        }
      }
    }
    return false;
  }
}

/**
 * Example 4: Creating program with diagnostic checking
 * ✅ Checks diagnostics after program creation
 */
function createProgramSafely(fileNames: string[], options: ts.CompilerOptions) {
  try {
    const program = ts.createProgram(fileNames, options);

    // ✅ Check diagnostics after program creation
    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
      console.error('Compilation errors found:');
      diagnostics.forEach((diagnostic) => {
        if (diagnostic.file) {
          const { line, character } = ts.getLineAndCharacterOfPosition(
            diagnostic.file,
            diagnostic.start!
          );
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          );
          console.error(
            `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
          );
        } else {
          console.error(
            ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          );
        }
      });
    }

    return program;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating program:', error.message);
    }
    return null;
  }
}

/**
 * Example 5: Custom compiler host with error handling
 * ✅ getSourceFile handles errors gracefully
 */
function createCustomCompilerHost(): ts.CompilerHost {
  const defaultHost = ts.createCompilerHost({});

  return {
    ...defaultHost,
    getSourceFile: (fileName, languageVersion, onError) => {
      try {
        // ✅ File reading wrapped in try-catch
        const sourceText = ts.sys.readFile(fileName);
        if (sourceText === undefined) {
          if (onError) {
            onError(`File not found: ${fileName}`);
          }
          return undefined;
        }
        return ts.createSourceFile(fileName, sourceText, languageVersion);
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(`Error reading ${fileName}: ${error.message}`);
        }
        return undefined;
      }
    }
  };
}

/**
 * Example 6: Complete compilation workflow with proper error handling
 * ✅ All operations wrapped appropriately
 */
function compileProject(rootDir: string, outDir: string): boolean {
  try {
    // ✅ Read directory with error handling
    const fileNames = ts.sys.readDirectory(
      rootDir,
      ['.ts'],
      undefined,
      undefined
    );

    if (fileNames.length === 0) {
      console.log('No TypeScript files found');
      return false;
    }

    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      outDir: outDir,
    };

    const program = ts.createProgram(fileNames, options);

    // ✅ Check pre-emit diagnostics
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
      console.error('Compilation errors found, aborting emit');
      return false;
    }

    // ✅ Emit and check result
    const emitResult = program.emit();

    if (emitResult.emitSkipped) {
      console.error('Emit skipped due to errors');
      return false;
    }

    if (emitResult.diagnostics.length > 0) {
      console.error('Emit diagnostics found');
      return false;
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Compilation failed:', error.message);
    }
    return false;
  }
}

// Export functions for testing
export {
  readSourceFileSafely,
  scanTypescriptFilesSafely,
  writeOutputFileSafely,
  createProgramSafely,
  createCustomCompilerHost,
  compileProject,
};
