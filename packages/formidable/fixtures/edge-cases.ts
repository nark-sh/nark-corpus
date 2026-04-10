import formidable, { errors as formidableErrors } from 'formidable';
import type { IncomingMessage } from 'http';

/**
 * Tests edge cases and advanced error handling patterns.
 */

// Edge Case 1: Specific error code handling
async function handleSpecificErrors(req: IncomingMessage) {
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFields: 50
  });

  try {
    const [fields, files] = await form.parse(req);
    return { success: true, fields, files };
  } catch (err: any) {
    // Properly handle specific error codes
    if (err.code === formidableErrors.maxFieldsExceeded) {
      return { error: 'Too many fields submitted', code: 'MAX_FIELDS' };
    }

    // Handle HTTP status codes
    const httpCode = err.httpCode || 400;
    return { error: err.message, httpCode };
  }
}

// Edge Case 2: Filter function with custom errors
async function handleWithFilter(req: IncomingMessage) {
  const form = formidable({
    filter: function ({ name, originalFilename, mimetype }) {
      // Custom validation - can emit errors
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (mimetype && !allowedTypes.includes(mimetype)) {
        // This will cause parse() to throw
        return false;
      }
      return true;
    }
  });

  try {
    const [fields, files] = await form.parse(req);
    return { success: true, files };
  } catch (err: any) {
    return { error: 'Invalid file type', details: err.message };
  }
}

// Edge Case 3: Event-based error handling (low detection)
function handleWithEvents(req: IncomingMessage) {
  const form = formidable();

  form.on('error', (err) => {
    console.error('Form parsing error:', err);
  });

  form.on('aborted', () => {
    console.error('Request was aborted by client');
  });

  form.on('end', () => {
    console.log('Form parsing complete');
  });

  // Note: Event-based pattern cannot be detected by current analyzer
  form.parse(req);
}

// Edge Case 4: Callback-based (legacy v2 pattern, low detection)
function handleWithCallback(req: IncomingMessage, callback: (err: any, fields: any, files: any) => void) {
  const form = formidable();

  // Callback pattern - analyzer has low detection for this
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Parse error:', err);
      callback(err, null, null);
      return;
    }
    callback(null, fields, files);
  });
}

// ❌ Edge Case 5: No error handling at all (should detect)
async function noErrorHandling(req: IncomingMessage) {
  const form = formidable();
  const [fields, files] = await form.parse(req);
  return files;
}
