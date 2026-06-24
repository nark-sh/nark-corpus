/**
 * Ground-truth test fixtures for multer depth pass (2026-04-16)
 * Tests new postconditions for fields(), any(), none(), and diskStorage()
 *
 * @expect-violation annotations mark cases the scanner SHOULD flag.
 * @expect-clean annotations mark cases the scanner SHOULD NOT flag.
 */

import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// fields() — VIOLATION cases
// ---------------------------------------------------------------------------

// @expect-violation: fields-throws-multer-error-unexpected-file
// @expect-violation: fields-throws-multer-error-size-or-count
function setupFieldsRouteNoErrorHandling(app: any) {
  const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
  app.post('/upload-fields',
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'gallery', maxCount: 8 }
    ]),
    // ❌ No error handling middleware — MulterError from unexpected fields or size limits
    // will fall through to Express default handler and return unformatted 500
    (req: Request, res: Response) => {
      res.json({ files: req.files });
    }
  );
}

// @expect-clean
function setupFieldsRouteWithErrorHandling(app: any) {
  const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: `Unexpected field: ${err.field}` });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(500).json({ error: 'Upload failed' });
    }
    next();
  }

  app.post('/upload-fields',
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'gallery', maxCount: 8 }
    ]),
    errorHandler, // ✅ Proper error handling middleware
    (req: Request, res: Response) => {
      res.json({ files: req.files });
    }
  );
}

// ---------------------------------------------------------------------------
// any() — VIOLATION cases
// ---------------------------------------------------------------------------

// @expect-violation: any-unrestricted-upload-no-filter
// @expect-violation: any-throws-multer-error-size
function setupAnyRouteNoFilterNoLimits(app: any) {
  // ❌ No fileFilter, no limits — any() will accept ALL files from ANY field
  // Malicious users can upload executables, scripts, or gigabyte files
  const upload = multer({ dest: 'uploads/' });
  app.post('/upload-any',
    upload.any(),
    // ❌ No error handling middleware either
    (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      res.json({ count: files?.length });
    }
  );
}

// @expect-violation: any-unrestricted-upload-no-filter
function setupAnyRouteWithLimitsButNoFilter(app: any) {
  // ❌ Has limits but still no fileFilter — will accept executables up to the limit
  const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }

  app.post('/upload-any',
    upload.any(),
    errorHandler,
    (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      res.json({ count: files?.length });
    }
  );
}

// @expect-clean
function setupAnyRouteWithFilterAndLimits(app: any) {
  // ✅ Proper configuration: fileFilter + limits + error handling
  const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024, files: 10 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'));
      }
    }
  });

  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  }

  app.post('/upload-any',
    upload.any(),
    errorHandler, // ✅ Error handling
    (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      res.json({ count: files?.length });
    }
  );
}

// ---------------------------------------------------------------------------
// none() — VIOLATION cases
// ---------------------------------------------------------------------------

// @expect-violation: none-throws-multer-error-on-file-upload
function setupNoneRouteNoErrorHandling(app: any) {
  const upload = multer();
  app.post('/submit-form',
    upload.none(),
    // ❌ No error handling — if client sends a file, LIMIT_UNEXPECTED_FILE error
    // is unhandled and returns a generic 500 instead of a clean 400
    (req: Request, res: Response) => {
      res.json({ body: req.body });
    }
  );
}

// @expect-clean
function setupNoneRouteWithErrorHandling(app: any) {
  const upload = multer();

  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
      // ✅ Explicitly handle the "file received in text-only form" case
      return res.status(400).json({ error: 'This endpoint does not accept file uploads' });
    }
    if (err) {
      return res.status(500).json({ error: 'Form processing failed' });
    }
    next();
  }

  app.post('/submit-form',
    upload.none(),
    errorHandler, // ✅ Proper error handling
    (req: Request, res: Response) => {
      res.json({ body: req.body });
    }
  );
}

// ---------------------------------------------------------------------------
// diskStorage() — VIOLATION cases
// ---------------------------------------------------------------------------

// @expect-violation: disk-storage-destination-permission-error
function createDiskStorageNoErrorHandling() {
  // ❌ If '/restricted-uploads' does not exist or is not writable,
  // fs.mkdirSync throws synchronously at construction — no try-catch here
  const storage = multer.diskStorage({
    destination: '/restricted-uploads',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  return multer({ storage });
}

// @expect-clean
function createDiskStorageWithErrorHandling() {
  // ✅ Use function-form destination callback so errors propagate to next(err)
  // and can be caught by error handling middleware, rather than throwing at startup
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
      cb(null, uploadDir); // ✅ errors passed as first arg go through next(err)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
  });
}

// @expect-violation: disk-storage-write-error
function setupDiskStorageRouteNoWriteErrorHandling(app: any) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/tmp/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  const upload = multer({ storage });

  app.post('/upload',
    upload.single('file'),
    // ❌ No error handling — disk full (ENOSPC), permission (EACCES), or path errors
    // from the write stream go unhandled
    (req: Request, res: Response) => {
      res.json({ file: req.file });
    }
  );
}

// @expect-clean
function setupDiskStorageRouteWithWriteErrorHandling(app: any) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.UPLOAD_DIR || '/tmp/uploads');
    },
    filename: (req, file, cb) => {
      const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + suffix);
    }
  });

  const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    if (err?.code === 'ENOSPC') {
      // ✅ Explicit handling for disk full scenario
      return res.status(507).json({ error: 'Insufficient storage space' });
    }
    if (err?.code === 'EACCES') {
      // ✅ Explicit handling for permission denied
      return res.status(500).json({ error: 'Storage configuration error' });
    }
    if (err) {
      return res.status(500).json({ error: 'File upload failed' });
    }
    next();
  }

  app.post('/upload',
    upload.single('file'),
    errorHandler, // ✅ Proper error handling for disk errors
    (req: Request, res: Response) => {
      res.json({ file: req.file });
    }
  );
}

// ---------------------------------------------------------------------------
// fields() — field-name DoS / field-limit VIOLATION (added 2026-06-24 pass 46)
// ---------------------------------------------------------------------------

// SHOULD_FIRE: fields-throws-multer-error-field-limits
function setupFieldsRouteNoFieldLimitGuards(app: any) {
  // No fieldNestingDepth, no parts limit, no fields limit. A hostile client can
  // send "a[b][c][d][e]..." or thousands of parts and crash request handling.
  const upload = multer({ dest: 'uploads/' });
  app.post('/upload-fields-unsafe',
    upload.fields([{ name: 'avatar', maxCount: 1 }]),
    (req: Request, res: Response) => {
      res.json({ files: req.files });
    }
  );
}

// @expect-clean
function setupFieldsRouteWithFieldLimitGuards(app: any) {
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 5 * 1024 * 1024,
      fieldNestingDepth: 3,
      parts: 50,
      fields: 20,
    },
  });

  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
      if (
        err.code === 'LIMIT_FIELD_NESTING' ||
        err.code === 'LIMIT_PART_COUNT' ||
        err.code === 'LIMIT_FIELD_COUNT' ||
        err.code === 'LIMIT_FIELD_KEY' ||
        err.code === 'LIMIT_FIELD_VALUE' ||
        err.code === 'MISSING_FIELD_NAME'
      ) {
        return res.status(400).json({ error: `Bad request: ${err.code}` });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(500).json({ error: 'Upload failed' });
    next();
  }

  app.post('/upload-fields-safe',
    upload.fields([{ name: 'avatar', maxCount: 1 }]),
    errorHandler,
    (req: Request, res: Response) => {
      res.json({ files: req.files });
    }
  );
}

export {
  setupFieldsRouteNoErrorHandling,
  setupFieldsRouteWithErrorHandling,
  setupAnyRouteNoFilterNoLimits,
  setupAnyRouteWithLimitsButNoFilter,
  setupAnyRouteWithFilterAndLimits,
  setupNoneRouteNoErrorHandling,
  setupNoneRouteWithErrorHandling,
  createDiskStorageNoErrorHandling,
  createDiskStorageWithErrorHandling,
  setupDiskStorageRouteNoWriteErrorHandling,
  setupDiskStorageRouteWithWriteErrorHandling,
  setupFieldsRouteNoFieldLimitGuards,
  setupFieldsRouteWithFieldLimitGuards,
};
