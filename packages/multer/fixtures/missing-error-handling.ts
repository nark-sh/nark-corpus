/**
 * Missing Error Handling for multer
 * Should produce ERROR violations
 */

import multer from 'multer';
import { Request, Response } from 'express';

// ❌ No limits configured (DoS vulnerability)
const uploadNoLimits = multer({
  dest: 'uploads/'
});

// ❌ No file filter (accepts any file type)
const uploadNoFilter = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ❌ No error handling middleware
function setupRouteWithoutErrorHandling(app: any) {
  app.post('/upload',
    uploadNoLimits.single('file'),
    // ❌ No error handling middleware here
    (req: Request, res: Response) => {
      res.json({ file: req.file });
    }
  );
}

// ❌ Array upload without error handling
function setupMultipleFilesNoErrorHandling(app: any) {
  app.post('/upload-multiple',
    uploadNoLimits.array('files', 10),
    // ❌ No error handling
    (req: Request, res: Response) => {
      res.json({ files: req.files });
    }
  );
}

// ❌ Wildcard origin with credentials
const uploadWildcard = multer({
  dest: 'uploads/',
  limits: { fileSize: 1024 * 1024 }
});

function setupUnsafeUpload(app: any) {
  app.post('/unsafe-upload',
    uploadWildcard.single('document'),
    (req: Request, res: Response) => {
      // ❌ No validation, no error handling
      res.json({ success: true });
    }
  );
}

export {
  uploadNoLimits,
  uploadNoFilter,
  setupRouteWithoutErrorHandling,
  setupMultipleFilesNoErrorHandling,
  setupUnsafeUpload
};
