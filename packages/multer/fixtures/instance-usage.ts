/**
 * Instance Usage for multer
 * Tests detection via multer instances
 */

import multer from 'multer';
import { Request, Response } from 'express';

class FileUploadService {
  private uploader: multer.Multer;
  
  constructor() {
    // ❌ No limits or fileFilter
    this.uploader = multer({ dest: 'uploads/' });
  }
  
  // ❌ No error handling middleware
  setupSingleUpload(app: any) {
    app.post('/upload',
      this.uploader.single('file'),
      (req: Request, res: Response) => {
        res.json({ file: req.file });
      }
    );
  }
  
  // ❌ No error handling
  setupMultipleUpload(app: any) {
    app.post('/upload-many',
      this.uploader.array('files'),
      (req: Request, res: Response) => {
        res.json({ files: req.files });
      }
    );
  }
}

class DocumentUploadService {
  private documentUploader: multer.Multer;
  
  constructor() {
    this.documentUploader = multer({
      dest: 'documents/',
      limits: { fileSize: 5 * 1024 * 1024 }
    });
  }
  
  // ❌ Missing error handling middleware
  handleUpload(app: any) {
    app.post('/document',
      this.documentUploader.single('doc'),
      (req: Request, res: Response) => {
        res.json({ uploaded: true });
      }
    );
  }
}

// ❌ Module-level multer without configuration
const upload = multer({ dest: 'temp/' });

export { FileUploadService, DocumentUploadService, upload };
