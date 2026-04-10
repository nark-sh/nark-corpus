# Sources: archiver

**Package:** archiver
**Version Range:** >=5.0.0
**Research Date:** 2026-02-26

---

## Official Documentation

- **npm Package**: [archiver](https://www.npmjs.com/package/archiver)
- **Official Documentation**: [archiverjs.com](https://www.archiverjs.com/)
- **API Documentation**: [archiver API](https://www.archiverjs.com/docs/archiver/)
- **Quick Start Guide**: [archiver quickstart](https://www.archiverjs.com/docs/quickstart/)
- **GitHub Repository**: [archiverjs/node-archiver](https://github.com/archiverjs/node-archiver)

---

## CVE References

### CVE-2024-0406: Path Traversal (Zip Slip)

**Affected Package:** mholt/archiver (Go implementation)
**Severity:** High
**Description:** Path traversal vulnerability allowing malicious archives to write files outside target directory

- **GitHub Advisory**: [GHSA-rhh4-rh7c-7r5v](https://github.com/advisories/GHSA-rhh4-rh7c-7r5v)
- **Snyk Research**: [Zip Slip Vulnerability](https://security.snyk.io/research/zip-slip-vulnerability)
- **JFrog Research**: [archiver Zip Slip](https://research.jfrog.com/vulnerabilities/archiver-zip-slip/)
- **SentinelOne**: [CVE-2025-3445](https://www.sentinelone.com/vulnerability-database/cve-2025-3445/)

**Note:** While this CVE specifically affects the Go implementation (mholt/archiver), the Node.js archiver package is used for **creating** archives. Users must be aware of Zip Slip when extracting archives created with this package.

---

## GitHub Issues (Real-World Bugs)

### Error Handling Issues

- **Issue #321**: [Dealing with readstream errors in append](https://github.com/archiverjs/node-archiver/issues/321)
  - Read stream errors don't propagate to archive error handler
  - Must handle errors on both archive and source stream

- **Issue #181**: [Archiver error event](https://github.com/archiverjs/node-archiver/issues/181)
  - Discussion of error event handling patterns
  - When errors are emitted vs thrown

- **Issue #363**: [Testing on('error', ...) events](https://github.com/archiverjs/node-archiver/issues/363)
  - Unit testing error handling

### Missing finalize() Call

- **Issue #457**: [Process exits without warning or error if finalize() forgotten](https://github.com/archiverjs/node-archiver/issues/457)
  - Process exits silently with code 0
  - Event loop becomes empty, Node exits
  - No archive created, silent failure

### Corrupt Archive Issues

- **Issue #491**: [Producing broken (bad CRC) zip archives on Node v15.6.0](https://github.com/archiverjs/node-archiver/issues/491)
  - Intermittent corrupt ZIP files with CRC errors
  - Node.js version specific issue

- **Issue #161**: [Corrupt zip files](https://github.com/archiverjs/node-archiver/issues/161)
  - Production issues with corrupt archives
  - File sizes consistent but corruption intermittent

- **Issue #91**: [Corrupt zip creation](https://github.com/archiverjs/node-archiver/issues/91)
  - Earlier reports of corrupt archive generation

### HTTP Streaming Issues

- **Issue #170**: [Streaming to res not working, getting empty errored file](https://github.com/archiverjs/node-archiver/issues/170)
  - Corrupt files when streaming to HTTP response
  - Express setting incorrect Content-Length
  - Streaming to file works, streaming to HTTP fails

### Version Compatibility

- **Issue #236**: [Throws error in node v8.0.0](https://github.com/archiverjs/node-archiver/issues/236)
  - Node v8.0.0 broke archiver
  - zlib.DeflateRaw changed from function to class
  - Breaking change in Node.js

### Performance Issues

- **Issue #60**: [Seeing intermittent hangs creating zip archives](https://github.com/archiverjs/node-archiver/issues/60)
  - Archive creation hangs partway through
  - No error events emitted
  - Large files or memory pressure

### Webpack Integration

- **Issue #349**: [Error with webpack](https://github.com/archiverjs/node-archiver/issues/349)
  - Webpack 4.21.0 compatibility issues
  - "input source must be valid Stream or Buffer instance"

---

## Code Examples

- **Snyk Advisor**: [Top 5 archiver Code Examples](https://snyk.io/advisor/npm-package/archiver/example)
- **Tabnine**: [archiver.Archiver.on examples](https://www.tabnine.com/code/javascript/functions/archiver/Archiver/on)
- **Socket Security**: [archiver Package Analysis](https://socket.dev/npm/package/archiver)

---

## Error Handling Patterns

### Event-Driven Model

archiver uses event-driven error handling similar to the `ws` package:

```typescript
// ✅ Proper error handling
const archive = archiver('zip');
archive.on('error', (err) => {
  console.error('Archive error:', err);
  throw err;
});
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('File not found:', err);
  } else {
    throw err;
  }
});
```

### Required Events

1. **'error' event** (REQUIRED)
   - Blocking errors: compression failures, write errors, I/O errors
   - Without handler, process crashes

2. **'warning' event** (RECOMMENDED)
   - Non-blocking errors: ENOENT (file not found), stat failures
   - Without handler, warnings are silently ignored

3. **Stream events** (OPTIONAL)
   - 'end', 'close', 'finish' from Node.js Stream API
   - Used to detect completion

### Common Error Types

- **ENOENT**: File or directory not found
- **EACCES**: Permission denied
- **EMFILE**: Too many open files
- **Compression errors**: zlib compression failures
- **Stream errors**: Write stream failures, backpressure issues

---

## Contract Rationale

### ERROR Severity Violations

1. **No 'error' event listener**
   - Justification: Unhandled errors crash the process
   - Real-world impact: Production crashes, corrupt archives
   - References: Issues #321, #170, #491

2. **Missing finalize() call**
   - Justification: Archive never completes, silent failure
   - Real-world impact: No archive created, process exits with code 0
   - References: Issue #457

3. **HTTP streaming without error handling**
   - Justification: Corrupt downloads, hung connections
   - Real-world impact: Users receive corrupt ZIP files
   - References: Issues #170, #491

### WARNING Severity Violations

1. **No 'warning' event listener**
   - Justification: Non-blocking errors ignored, incomplete archives
   - Real-world impact: Missing files in archive, no feedback
   - References: Official documentation

2. **Read stream errors not handled**
   - Justification: Stream errors may not propagate to archive
   - Real-world impact: Unhandled promise rejections, crashes
   - References: Issue #321

---

## Best Practices

1. **Always attach error and warning listeners before operations**
   - Pattern same as `ws` package
   - Listeners must exist before `finalize()` call

2. **Handle errors on both archive and source streams**
   - append() with streams requires dual error handling
   - Source stream errors may not propagate

3. **Always call finalize() and await completion**
   - Required for archive to complete
   - Use await or listen for 'close'/'finish' events

4. **Validate files before adding to archive**
   - Check if files/directories exist
   - Avoid ENOENT warnings

5. **Set appropriate headers for HTTP streaming**
   - Content-Type, Content-Disposition
   - Handle errors gracefully, send HTTP 500 on failure

---

## Research Methodology

1. **Official Documentation Review**
   - Read npm package docs, API reference, quickstart guides
   - Identified event-driven error model

2. **CVE Analysis**
   - Searched for "archiver CVE", "archiver vulnerability"
   - Found CVE-2024-0406 (Zip Slip in Go implementation)

3. **GitHub Issues Analysis**
   - Reviewed 10+ issues related to error handling
   - Identified common bugs: missing error handlers, corrupt archives, missing finalize()

4. **Code Examples Review**
   - Analyzed Snyk and Tabnine examples
   - Identified proper error handling patterns

5. **Security Research**
   - Reviewed JFrog, Snyk, SentinelOne security advisories
   - Documented Zip Slip vulnerability

---

## Verification Status

✅ All URLs verified as of 2026-02-26
✅ CVE references cross-checked
✅ GitHub issues reviewed and quoted accurately
✅ Official documentation reviewed
✅ Error handling patterns validated against official docs

---

## Contract Version History

- **v1.0.0** (2026-02-26): Initial contract creation
  - Event-driven error handling model
  - All key functions documented
  - Real-world bugs referenced
  - CVE-2024-0406 documented
