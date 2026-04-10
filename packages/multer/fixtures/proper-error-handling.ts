/**
 * Proper Error Handling for multer
 * Should produce 0 violations
 */

import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// ✅ Configure with limits
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    // ✅ Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ✅ Error handling middleware
function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err) {
    return res.status(500).json({ error: 'Upload failed' });
  }
  
  next();
}

// ✅ Route with error handling
function setupUploadRoute(app: any) {
  app.post('/upload',
    upload.single('file'),
    handleMulterError,
    (req: Request, res: Response) => {
      if (\!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      res.json({ filename: req.file.filename });
    }
  );
}

export { upload, handleMulterError, setupUploadRoute };
