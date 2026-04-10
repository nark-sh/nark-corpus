# Sources for busboy Behavioral Contract

## Official Documentation
- **npm Package**: https://www.npmjs.com/package/busboy
- **GitHub Repository**: https://github.com/mscdex/busboy
- **Fastify Fork**: https://github.com/fastify/busboy (@fastify/busboy)
- **npm Downloads**: 11M+ weekly downloads (via @fastify/busboy)

## Error Handling Documentation

### Constructor Errors (THROWS)
- **Issue #140**: https://github.com/mscdex/busboy/issues/140
  - Constructor throws exceptions if headers are invalid/missing
  - Missing Content-Type header
  - Unsupported Content-Type
  - Missing boundary for multipart/form-data
  - README examples don't wrap constructor in try-catch (can crash server)

- **Issue #13**: https://github.com/mscdex/busboy/issues/13
  - Crashes for some requests with malformed headers

- **Issue #269**: https://github.com/mscdex/busboy/issues/269
  - Getting an error with v1.3.0 related to constructor validation

### Event-Based Errors (EMITS)
- **Issue #234**: https://github.com/mscdex/busboy/issues/234
  - "Docs lacks on error handling: How handle errors with Busboy?"
  - Discussion of 'error' event handling
  - Need to listen for 'error' event: `busboy.on('error', fn)`

- **Issue #84**: https://github.com/mscdex/busboy/issues/84
  - "Need to document how to handle errors"
  - Error event is standard Node.js stream event

- **Issue #171**: https://github.com/mscdex/busboy/issues/171
  - "Busboy often throws Unhandled 'error' event Unexpected end of multipart data"
  - Common error when multipart data is malformed
  - Caused by incorrect line endings (\n vs \r\n)

- **Issue #180**: https://github.com/mscdex/busboy/issues/180
  - "Better documentation of events"
  - Discusses all event types including error handling

- **Pull Request #131**: https://github.com/mscdex/busboy/pull/131/files
  - "Emit last file error on unexpected end of multipart data"
  - Shows how errors are emitted during parsing

### Limit Events
- **npm documentation**: https://www.npmjs.com/package/busboy
  - `partsLimit()` event - emitted when limits.parts reached
  - `filesLimit()` event - emitted when limits.files reached
  - `fieldsLimit()` event - emitted when limits.fields reached
  - File stream 'limit' event - emitted when limits.fileSize reached
  - File stream 'truncated' property set to true when size limit hit

- **Issue #287**: https://github.com/mscdex/busboy/issues/287
  - "`partsLimit` is being thrown when busboy is configured for one file"
  - Shows how limit events work

## Security Vulnerabilities

### CVE-2022-24434 (Denial of Service)
- **CVE Details**: https://www.cvedetails.com/cve/CVE-2022-24434/
- **Snyk Vulnerability**: https://security.snyk.io/package/npm/busboy
- **Description**: DoS vulnerability in transitive dependency 'dicer'
  - Crash in HeaderParser when processing manipulated multipart/form-data headers
  - Can crash web server based on it
- **Affected**: busboy < 1.0.0 (via dicer dependency)
- **Fixed**: busboy >= 1.0.0 (dicer removed from dependencies)
- **Multer PR #1097**: https://github.com/expressjs/multer/pull/1097
  - Shows fix by bumping busboy to 1.0.0+

### Maintenance Status
- **Snyk**: Last version release was over a year ago
- **npm**: Latest version is 1.6.0
- **Fastify fork**: @fastify/busboy is actively maintained alternative

## Real-World Usage Examples

### Express Middleware Pattern
- **Spin.atomicobject.com**: https://spin.atomicobject.com/busboy-express-middleware/
  - "How to Use busboy for File Uploads in Express Middleware"
  - Shows error handling with `bb.on('error', err => { next(err); })`
  - Demonstrates wrapping async operations in try-catch

- **Generalist Programmer**: https://generalistprogrammer.com/tutorials/busboy-npm-package-guide
  - Busboy Guide with comprehensive examples
  - Shows proper error handling patterns

- **ByteArcher**: https://bytearcher.com/articles/terminate-busboy/
  - "Terminate busboy from reading more request with unpipe() and work queue"
  - Advanced error handling with PQueue
  - Shows `req.unpipe(busboy)` pattern on errors
  - Demonstrates workQueue.pause() to prevent further processing

### Code Examples
- **Snyk Code Examples**: https://snyk.io/advisor/npm-package/busboy/example
  - Top 5 busboy code examples showing error handling

- **Tabnine Examples**: https://www.tabnine.com/code/javascript/functions/busboy/Busboy/on
  - Real-world code examples of busboy.on('error', ...)

- **GitHub Gist**: https://gist.github.com/shobhitg/5b367f01b6daf46a0287
  - File upload example using busboy with express

- **Next.js Example**: https://github.com/zachgoll/file-upload-examples/blob/e6f1b6bd115f2350829a7e12db64ccb466f7de73/examples/nextjs-uploads/pages/api/upload-with-busboy.ts
  - Next.js API route with busboy file upload

## Wrapper Libraries

### await-busboy / then-busboy
- **then-busboy npm**: https://www.npmjs.com/package/then-busboy
- **await-busboy GitHub**: https://github.com/corupta/await-busboy
- These wrappers throw errors when busboy emits limit events:
  - `partsLimit`, `filesLimit`, `fieldsLimit` → throws error

## Common Error Patterns

### Missing Try-Catch on Constructor
```javascript
// ❌ BAD - can crash server
const busboy = new Busboy({ headers: req.headers });

// ✅ GOOD - wrapped in try-catch
try {
  const busboy = new Busboy({ headers: req.headers });
} catch (error) {
  // Handle invalid headers
}
```

### Missing Error Event Listener
```javascript
// ❌ BAD - unhandled error event can crash server
const busboy = new Busboy({ headers: req.headers });
req.pipe(busboy);

// ✅ GOOD - error event listener added
const busboy = new Busboy({ headers: req.headers });
busboy.on('error', (err) => {
  console.error('Parse error:', err);
});
req.pipe(busboy);
```

### Not Consuming File Streams
- If you listen for 'file' event, you MUST consume the stream
- Use `stream.resume()` to discard contents
- Otherwise 'finish'/'close' event never fires

## Version Information
- **Minimum Safe Version**: 1.0.0+ (fixes CVE-2022-24434)
- **Latest Version**: 1.6.0 (as of research date)
- **Alternative**: @fastify/busboy (actively maintained fork)

## Detection Challenges

### What Analyzer CAN Detect (80-90%)
- ✅ Constructor errors (throws exception)
- ✅ Try-catch around constructor
- ✅ Synchronous validation errors

### What Analyzer CANNOT Detect (Currently)
- ❌ Event listener: `busboy.on('error', fn)`
- ❌ Event listener: `busboy.on('partsLimit', fn)`
- ❌ Event listener: `busboy.on('filesLimit', fn)`
- ❌ Event listener: `busboy.on('fieldsLimit', fn)`
- ❌ File stream 'limit' event
- ❌ File stream 'truncated' property checks

**Overall Detection Rate: 30-40%** (mixed pattern - constructor throws, but most errors via events)

## Related Issues
- **Issue #44**: https://github.com/mscdex/busboy/issues/44
  - Handling aborted uploads
- **Issue #233**: https://github.com/mscdex/busboy/issues/233
  - ENOENT error after busboy received the file
- **Multer Issue #961**: https://github.com/expressjs/multer/issues/961
  - Error: Unexpected end of multipart data (Busboy and Dicer)

## References
- **npm Compare**: https://npm-compare.com/@fastify/multipart,busboy,formidable,multer
  - Comparison of file upload libraries
- **Socket.dev**: https://socket.dev/npm/package/@fastify/busboy
  - Security analysis of @fastify/busboy
