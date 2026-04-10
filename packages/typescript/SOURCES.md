# TypeScript Behavioral Contract - Sources

**Package:** typescript
**Contract Version:** 1.0.0
**Last Updated:** 2026-02-24

---

## Official Documentation

### TypeScript Compiler API

- **Using the Compiler API** (Primary Source)
  - URL: https://github.com/microsoft/TypeScript-wiki/blob/main/Using-the-Compiler-API.md
  - Relevance: Official guide on using ts.createProgram, ts.createCompilerHost, and diagnostics handling
  - Key Points:
    - Demonstrates diagnostic collection via `ts.getPreEmitDiagnostics()`
    - Shows compiler host creation and customization
    - Documents program creation workflow

- **Module Resolution**
  - URL: https://www.typescriptlang.org/docs/handbook/module-resolution.html
  - Relevance: Explains how TypeScript resolves modules and handles resolution failures
  - Key Points:
    - Module resolution errors appear in diagnostics
    - File-not-found handled through diagnostics system
    - `traceResolution` option for debugging

### Node.js Error Reference

- **Node.js Error Codes**
  - URL: https://nodejs.org/docs/latest/api/errors.html
  - Relevance: Documents ENOENT, EACCES, ELOOP, ENOSPC, EROFS and other file system errors
  - Key Points:
    - ENOENT: File or directory not found
    - EACCES: Permission denied
    - ELOOP: Too many symbolic links
    - ENOSPC: No space left on device
    - EROFS: Read-only file system

---

## Error Handling Best Practices

- **TypeScript Error Handling Guide**
  - URL: https://www.dhiwise.com/post/typescript-error-handling-pitfalls-and-how-to-avoid-them
  - Relevance: General TypeScript error handling patterns
  - Key Points:
    - Use try-catch for operations that can throw
    - Check for undefined returns from file operations
    - Validate inputs before processing

- **Exception Handling | TypeScript Deep Dive**
  - URL: https://basarat.gitbook.io/typescript/type-system/exceptions
  - Relevance: TypeScript exception handling philosophy
  - Key Points:
    - TypeScript doesn't track thrown exceptions in type system
    - Must rely on documentation and runtime checks
    - Always wrap I/O operations in try-catch

- **Error Handling in TypeScript Best Practices**
  - URL: https://medium.com/@arreyetta/error-handling-in-typescript-best-practices-80cdfe6d06db
  - Relevance: Best practices for production error handling
  - Key Points:
    - Strategic try-catch placement for I/O operations
    - Preserve error context when re-throwing
    - Input validation to prevent errors

---

## Real-World Usage Examples

### Next.js

- **TypeScript Plugin Test Utils**
  - File: `test-repos/nextjs/test/development/typescript-plugin/test-utils.ts`
  - Lines: 10, 31, 38, 69
  - Pattern: `ts.sys.readFile()` and `ts.sys.readDirectory()` called without try-catch
  - Anti-pattern: No error handling for file system operations
  - Found: 4 instances of unsafe usage

### Common Patterns Observed

1. **File Reading Without Error Handling**
   ```typescript
   const files = ts.sys.readDirectory(dir)  // ❌ No try-catch
   const contents = ts.sys.readFile(fileName)  // ❌ No try-catch
   ```

2. **Directory Scanning Assumptions**
   ```typescript
   export function getTsFiles(dir: string): string[] {
     return ts.sys.readDirectory(dir)  // ❌ Assumes dir exists
   }
   ```

3. **Diagnostic Checking Pattern** (Correct)
   ```typescript
   const program = ts.createProgram(files, options)
   const diagnostics = ts.getPreEmitDiagnostics(program)  // ✅ Checks diagnostics
   ```

---

## CVE Analysis

### TypeScript-Specific CVEs

- **CVE Database Search**
  - URL: https://www.cvedetails.com/version-list/26/136185/1/Microsoft-Typescript.html
  - URL: https://app.opencve.io/cve/?product=typescript&vendor=microsoft
  - URL: https://security.snyk.io/package/npm/typescript
  - Finding: Limited TypeScript-specific CVEs related to error handling
  - Most vulnerabilities are in tools built with TypeScript, not TypeScript itself

### Related Tool Vulnerabilities

- **Orval Code Injection (CVE-2026-23947)**
  - Description: Code injection in TypeScript client generator
  - Relevance: Shows importance of input validation when generating TypeScript code
  - Not directly related to file system error handling

---

## GitHub Issues & Discussions

- **ts.sys.readDirectory Behavior**
  - URL: https://github.com/microsoft/TypeScript/issues/46788
  - Relevance: Discusses expected behavior of readDirectory
  - Key Points:
    - Return value semantics
    - Error handling not explicitly documented

---

## Behavioral Insights

### File System Operations

**Pattern:** TypeScript's `ts.sys.*` methods are thin wrappers around Node.js file system operations.

**Evidence:**
1. `ts.sys.readFile()` → Delegates to `fs.readFileSync()`
2. `ts.sys.readDirectory()` → Delegates to `fs.readdirSync()`
3. `ts.sys.writeFile()` → Delegates to `fs.writeFileSync()`

**Implication:** All Node.js file system errors can propagate through these methods.

### Diagnostics vs Exceptions

**Pattern:** TypeScript prefers diagnostics over exceptions for compilation errors.

**Evidence:**
- `ts.createProgram()` returns a program even with errors
- Errors accessible via `ts.getPreEmitDiagnostics()`
- File-not-found during compilation appears in diagnostics, not thrown

**Implication:** Must check diagnostics after program creation, not just catch exceptions.

### Defensive Programming

**Pattern:** Real-world code often lacks error handling around file system operations.

**Evidence:**
- Next.js test suite: 4 instances of unsafe `ts.sys.*` usage
- No try-catch blocks around file operations
- Assumption that files/directories exist

**Implication:** This behavioral contract addresses a common real-world vulnerability.

---

## Contract Design Decisions

### Why ERROR Severity for File System Operations?

**Rationale:**
1. File system errors (ENOENT, EACCES) cause application crashes if uncaught
2. Real-world usage shows this is a common oversight
3. These operations are used in build tools where crashes are costly

**Evidence:**
- Next.js production test suite has unhandled file operations
- No documentation warning about required error handling
- Node.js file system methods can throw multiple error types

### Why WARNING Severity for Diagnostics?

**Rationale:**
1. `ts.createProgram()` doesn't throw, it returns program with errors
2. Unchecked diagnostics lead to silent failures, not crashes
3. Less severe than unhandled exceptions but still important

**Evidence:**
- Official examples show diagnostic checking pattern
- TypeScript design prefers diagnostics over exceptions
- Emitting without checking diagnostics can produce invalid output

---

## Testing Strategy

### Fixtures Created

1. **proper-error-handling.ts**
   - Demonstrates correct try-catch around file operations
   - Shows diagnostic checking after program creation
   - Expected violations: 0

2. **missing-error-handling.ts**
   - Shows unsafe file operations without try-catch
   - Expected violations: Multiple ERROR violations

3. **instance-usage.ts**
   - Tests detection of `ts.sys.*` calls
   - Tests namespace method detection
   - Expected violations: Violations for unsafe calls

### Validation Repos

Planned testing against:
1. Next.js (known unsafe usage)
2. Vite (build tool usage)
3. TypeScript compiler itself (reference implementation)
4. Backstage (large TypeScript codebase)
5. Storybook (dev tool with TypeScript)

---

## Limitations & Future Work

### Known Limitations

1. **Namespace Detection**
   - Contract covers `ts.sys.*` methods
   - Analyzer must support namespace method detection
   - Current analyzer may need enhancement

2. **Custom Compiler Hosts**
   - Contract warns about custom `getSourceFile` implementations
   - Cannot detect all custom host error handling patterns
   - Relies on developer judgment

3. **Async Operations**
   - TypeScript also provides async file operations
   - This contract focuses on synchronous `ts.sys.*` methods
   - Future version could cover async variants

### Future Enhancements

1. **Program Lifecycle**
   - Detect `program.emit()` without checking `emitResult.diagnostics`
   - Warn about emitting programs with errors

2. **Language Service**
   - Cover `ts.createLanguageService()` error patterns
   - Detect missing error handling in custom language service hosts

3. **Watch Mode**
   - Cover watch mode file system error handling
   - Detect missing error handlers in watch callbacks

---

## Verification Checklist

- [x] All sources are publicly accessible
- [x] Official documentation cited for API behavior
- [x] Real-world examples demonstrate the issue
- [x] Error codes verified against Node.js documentation
- [x] Contract design justified with evidence
- [x] Testing strategy defined
- [x] Limitations documented

---

## Maintenance Notes

**Next Review:** 2026-08-24 (6 months)

**Watch For:**
- TypeScript API changes in major versions
- New file system methods added to `ts.sys`
- Changes to diagnostic handling in compiler
- Community discussions about error handling best practices

**Update Triggers:**
- TypeScript releases version 6.x with breaking changes
- New CVEs related to TypeScript file system operations
- Feedback from users encountering false positives
