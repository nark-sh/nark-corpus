import busboy from 'busboy';
import type { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// busboy-002: Constructor synchronous throws — Missing try/catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: busboy-002
// VIOLATES: no try/catch around busboy() call — will throw synchronously if
// Content-Type is missing, malformed, or unsupported. A GET request misrouted
// to this handler crashes the process with "Missing Content-Type".
function handleUploadMissingTryCatch(req: IncomingMessage, res: ServerResponse) {
  const bb = busboy({ headers: req.headers });
  bb.on('field', (name, value) => {
    console.log(`Field: ${name} = ${value}`);
  });
  bb.on('close', () => {
    res.writeHead(200);
    res.end('Done');
  });
  req.pipe(bb);
}

// @expect-clean
// CORRECT: busboy() constructor wrapped in try/catch to handle synchronous throws
function handleUploadWithTryCatch(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`Bad request: ${(err as Error).message}`);
    return;
  }

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('field', (name, value) => {
    console.log(`Field: ${name} = ${value}`);
  });
  bb.on('close', () => {
    res.writeHead(200);
    res.end('Done');
  });
  req.pipe(bb);
}

// ─────────────────────────────────────────────────────────────────────────────
// busboy-003: Limit events without handlers — silent data loss
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: busboy-003
// VIOLATES: no partsLimit/filesLimit/fieldsLimit event listeners — when limits
// are reached, overflow data is silently discarded with no indication to caller.
// Upload handler believes all form data was received when only partial data was.
function handleUploadMissingLimitHandlers(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({
      headers: req.headers,
      limits: {
        files: 3,
        fields: 10,
        parts: 20,
      },
    });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const fields: Record<string, string> = {};

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('field', (name, value) => {
    fields[name] = value;
  });
  // No partsLimit, filesLimit, or fieldsLimit listeners!
  bb.on('close', () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fields));
  });
  req.pipe(bb);
}

// @expect-clean
// CORRECT: all limit events handled — caller is notified when limits are reached
function handleUploadWithLimitHandlers(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({
      headers: req.headers,
      limits: {
        files: 3,
        fields: 10,
        parts: 20,
      },
    });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  let limitReached = false;
  const fields: Record<string, string> = {};

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('partsLimit', () => {
    limitReached = true;
    console.warn('Parts limit reached — some form data was discarded');
  });
  bb.on('filesLimit', () => {
    limitReached = true;
    console.warn('Files limit reached — some files were discarded');
  });
  bb.on('fieldsLimit', () => {
    limitReached = true;
    console.warn('Fields limit reached — some fields were discarded');
  });
  bb.on('field', (name, value) => {
    fields[name] = value;
  });
  bb.on('close', () => {
    if (limitReached) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Form data exceeded limits' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fields));
  });
  req.pipe(bb);
}

// ─────────────────────────────────────────────────────────────────────────────
// busboy-004: File stream truncation — partial file saved without detection
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: busboy-004
// VIOLATES: file.truncated not checked after stream ends — partial file saved
// to disk as if complete. When fileSize limit is hit, busboy emits 'limit' event
// and sets file.truncated = true but does NOT throw an error.
function handleFileUploadMissingTruncationCheck(
  req: IncomingMessage,
  res: ServerResponse,
  uploadDir: string
) {
  let bb;
  try {
    bb = busboy({
      headers: req.headers,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('file', (fieldname, file, info) => {
    const savePath = path.join(uploadDir, info.filename ?? 'upload');
    const writeStream = fs.createWriteStream(savePath);
    file.pipe(writeStream);
    // No 'limit' event listener and no file.truncated check!
    // Partial file will be saved silently.
    writeStream.on('close', () => {
      console.log(`Saved file: ${savePath}`); // May be a truncated partial file
    });
  });
  bb.on('close', () => {
    res.writeHead(200);
    res.end('Upload complete');
  });
  req.pipe(bb);
}

// @expect-clean
// CORRECT: file.truncated checked and limit event handled
function handleFileUploadWithTruncationCheck(
  req: IncomingMessage,
  res: ServerResponse,
  uploadDir: string
) {
  let bb;
  try {
    bb = busboy({
      headers: req.headers,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  let fileTruncated = false;
  let savedPath: string | null = null;

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('file', (fieldname, file, info) => {
    const savePath = path.join(uploadDir, info.filename ?? 'upload');
    savedPath = savePath;
    const writeStream = fs.createWriteStream(savePath);

    // Listen for limit event — fired when fileSize limit is hit
    file.on('limit', () => {
      fileTruncated = true;
      console.warn(`File ${info.filename} exceeded size limit and was truncated`);
    });

    file.pipe(writeStream);

    writeStream.on('close', () => {
      // Double-check via file.truncated property
      if (file.truncated) {
        fileTruncated = true;
        // Clean up partial file
        fs.unlink(savePath, () => {});
        savedPath = null;
      }
    });
  });
  bb.on('close', () => {
    if (fileTruncated) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File too large' }));
      return;
    }
    res.writeHead(200);
    res.end(JSON.stringify({ savedPath }));
  });
  req.pipe(bb);
}

// ─────────────────────────────────────────────────────────────────────────────
// busboy-005: File stream not consumed — request deadlock
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: busboy-005
// VIOLATES: file event listener is registered but stream is not always consumed.
// When skipFile is true, the file stream is left unconsumed — busboy 'close'
// event never fires and the request hangs indefinitely.
function handleUploadWithUnconsumedStream(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const skipFile = true; // Some condition — file not always consumed

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('file', (fieldname, file, info) => {
    if (skipFile) {
      // BUG: stream not consumed — close event never fires, request hangs!
      return;
    }
    const chunks: Buffer[] = [];
    file.on('data', (chunk: Buffer) => chunks.push(chunk));
    file.on('close', () => {
      console.log(`Received ${Buffer.concat(chunks).length} bytes`);
    });
  });
  bb.on('close', () => {
    res.writeHead(200);
    res.end('Done'); // This line is never reached when skipFile = true
  });
  req.pipe(bb);
}

// @expect-clean
// CORRECT: file stream always consumed — even when discarding use stream.resume()
function handleUploadWithAlwaysConsumedStream(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const skipFile = true; // Some condition

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('file', (fieldname, file, info) => {
    if (skipFile) {
      // CORRECT: use stream.resume() to discard contents and unblock parsing
      file.resume();
      return;
    }
    const chunks: Buffer[] = [];
    file.on('data', (chunk: Buffer) => chunks.push(chunk));
    file.on('close', () => {
      console.log(`Received ${Buffer.concat(chunks).length} bytes`);
    });
  });
  bb.on('close', () => {
    res.writeHead(200);
    res.end('Done');
  });
  req.pipe(bb);
}

// ─────────────────────────────────────────────────────────────────────────────
// busboy-006: Field value truncation — info.valueTruncated not checked
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: busboy-006
// VIOLATES: field handler does not check info.valueTruncated — when a field value
// exceeds limits.fieldSize (default 1MB), busboy silently delivers the truncated
// value to the 'field' callback. The handler stores corrupt data without detection.
function handleFieldsMissingTruncationCheck(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const fields: Record<string, string> = {};

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('field', (name, value, info) => {
    // BUG: info.valueTruncated not checked — storing potentially truncated data
    fields[name] = value;
  });
  bb.on('close', () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fields));
  });
  req.pipe(bb);
}

// @expect-clean
// CORRECT: field handler checks info.valueTruncated and rejects truncated submissions
function handleFieldsWithTruncationCheck(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const fields: Record<string, string> = {};
  let valueTruncated = false;

  bb.on('error', (err) => {
    res.writeHead(500);
    res.end('Parse error');
  });
  bb.on('field', (name, value, info) => {
    if (info.valueTruncated) {
      valueTruncated = true;
      console.warn(`Field '${name}' value was truncated (exceeded fieldSize limit)`);
      return;
    }
    fields[name] = value;
  });
  bb.on('close', () => {
    if (valueTruncated) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'A field value exceeded the maximum allowed size' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fields));
  });
  req.pipe(bb);
}

// ─────────────────────────────────────────────────────────────────────────────
// busboy-007: Unexpected end of form — client disconnects mid-upload
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: busboy-007
// VIOLATES: no error event listener attached — when a client disconnects mid-upload,
// busboy emits 'error' with 'Unexpected end of form'. Without a listener, Node.js
// throws an unhandled error event, crashing the server process.
// Note: busboy-001 already covers missing error handlers; this is a paired fixture
// showing the specific 'Unexpected end of form' recovery pattern.
function handleUploadNoErrorListenerForDisconnect(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  // BUG: No error listener — 'Unexpected end of form' crashes the server
  bb.on('field', (name, value) => {
    console.log(`Field: ${name} = ${value}`);
  });
  bb.on('close', () => {
    res.writeHead(200);
    res.end('Done');
  });
  req.pipe(bb);
}

// @expect-clean
// CORRECT: error handler covers 'Unexpected end of form' and performs cleanup
function handleUploadWithDisconnectRecovery(req: IncomingMessage, res: ServerResponse) {
  let bb;
  try {
    bb = busboy({ headers: req.headers });
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  bb.on('error', (err) => {
    // Handles 'Unexpected end of form', 'Unexpected end of file', 'Malformed part header'
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Upload was interrupted or form data is malformed' }));
    }
  });
  bb.on('field', (name, value) => {
    console.log(`Field: ${name} = ${value}`);
  });
  bb.on('close', () => {
    if (!res.headersSent) {
      res.writeHead(200);
      res.end('Done');
    }
  });
  req.pipe(bb);
}
