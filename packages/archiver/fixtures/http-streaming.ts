import archiver from 'archiver';
import * as http from 'http';

/**
 * Proper HTTP streaming with error handling
 * Should NOT trigger violations
 *
 * When streaming archives to HTTP responses, must handle errors on both
 * the archive and the response stream to avoid corrupt downloads.
 */
function handleDownloadRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const archive = archiver('zip', { zlib: { level: 9 } });

  // ✅ Archive error handler
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).send('Archive creation failed');
  });

  // ✅ Archive warning handler
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('File not found:', err);
    } else {
      throw err;
    }
  });

  // ✅ Response stream error handler
  res.on('error', (err) => {
    console.error('Response error:', err);
  });

  // Set proper headers
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=archive.zip');

  archive.pipe(res);
  archive.directory('source/', false);
  archive.finalize();
}

/**
 * Missing error handling on HTTP stream
 * Should trigger ERROR violation
 *
 * No error handlers on archive or response stream. Errors will result
 * in corrupt downloads or hung connections.
 */
function handleDownloadRequestBadly(req: http.IncomingMessage, res: http.ServerResponse) {
  const archive = archiver('zip', { zlib: { level: 9 } });

  // ❌ No error handlers - corrupt downloads, hung connections

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=archive.zip');

  archive.pipe(res);
  archive.directory('source/', false);
  archive.finalize();
}
