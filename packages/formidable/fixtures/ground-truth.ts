/**
 * Ground-truth test fixtures for formidable contract depth pass.
 *
 * Each function is annotated with @expect-violation or @expect-clean.
 * Postcondition IDs correspond to formidable/contract.yaml.
 *
 * Evidence sources:
 *   - https://github.com/node-formidable/formidable/blob/master/src/FormidableError.js
 *   - https://github.com/node-formidable/formidable/blob/master/README.md
 */

import formidable, { errors as formidableErrors } from 'formidable';
import type { IncomingMessage } from 'http';

// ---------------------------------------------------------------------------
// VIOLATION CASES — scanner SHOULD flag these
// ---------------------------------------------------------------------------

// @expect-violation: formidable-parse-error
// @expect-violation: formidable-max-file-size-exceeded
// @expect-violation: formidable-max-fields-exceeded
// @expect-violation: formidable-missing-content-type
// @expect-violation: formidable-malformed-multipart
// @expect-violation: formidable-request-aborted
// @expect-violation: formidable-no-empty-files
async function noErrorHandlingBasic(req: IncomingMessage) {
  const form = formidable({});
  const [fields, files] = await form.parse(req);
  return { fields, files };
}

// @expect-violation: formidable-parse-error
// @expect-violation: formidable-max-total-file-size-exceeded
// @expect-violation: formidable-max-files-exceeded
async function noErrorHandlingMultiFile(req: IncomingMessage) {
  const form = formidable({ maxFiles: 5, maxTotalFileSize: 10 * 1024 * 1024 });
  const [fields, files] = await form.parse(req);
  return files;
}

// @expect-violation: formidable-parse-error
// @expect-violation: formidable-cannot-create-dir
async function noErrorHandlingWithDirCreation(req: IncomingMessage) {
  const form = formidable({ createDirsFromUploads: true, uploadDir: '/tmp/uploads' });
  const [fields, files] = await form.parse(req);
  return files;
}

// @expect-violation: formidable-parse-error
// @expect-violation: formidable-max-fields-size-exceeded
async function noErrorHandlingFieldsSize(req: IncomingMessage) {
  const form = formidable({ maxFieldsSize: 1024 * 1024 }); // 1MB limit
  const [fields, files] = await form.parse(req);
  return fields;
}

// ---------------------------------------------------------------------------
// CLEAN CASES — scanner MUST NOT flag these
// ---------------------------------------------------------------------------

// @expect-clean
async function properHandlingAllErrors(req: IncomingMessage) {
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 10,
    maxFields: 100,
    maxFieldsSize: 2 * 1024 * 1024,
  });

  try {
    const [fields, files] = await form.parse(req);
    return { success: true, fields, files };
  } catch (err: any) {
    const httpCode = err.httpCode || 400;
    return { success: false, error: err.message, httpCode };
  }
}

// @expect-clean
async function specificErrorCodeHandling(req: IncomingMessage) {
  const form = formidable({ maxFileSize: 5 * 1024 * 1024, maxFields: 50 });

  try {
    const [fields, files] = await form.parse(req);
    return { fields, files };
  } catch (err: any) {
    if (err.code === formidableErrors.biggerThanMaxFileSize) {
      return { error: 'File too large', httpCode: 413 };
    }
    if (err.code === formidableErrors.maxFieldsExceeded) {
      return { error: 'Too many fields', httpCode: 413 };
    }
    if (err.code === formidableErrors.missingContentType) {
      return { error: 'Invalid content type', httpCode: 400 };
    }
    if (err.code === formidableErrors.aborted) {
      return { error: 'Upload cancelled by client', httpCode: 400 };
    }
    return { error: err.message, httpCode: err.httpCode || 500 };
  }
}

// @expect-clean
function callbackBasedWithErrorHandling(
  req: IncomingMessage,
  onSuccess: (fields: any, files: any) => void,
  onError: (err: Error) => void
) {
  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  form.parse(req, (err, fields, files) => {
    if (err) {
      onError(err);
      return;
    }
    onSuccess(fields, files);
  });
}

// @expect-clean
async function expressMiddlewarePattern(req: IncomingMessage, res: any, next: any) {
  const form = formidable({
    maxFileSize: 50 * 1024 * 1024,
    maxTotalFileSize: 100 * 1024 * 1024,
    allowEmptyFiles: false,
  });

  try {
    const [fields, files] = await form.parse(req);
    (req as any).fields = fields;
    (req as any).files = files;
    next();
  } catch (err: any) {
    res.status(err.httpCode || 400).json({ error: err.message });
  }
}
