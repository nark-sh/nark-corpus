import formidable, { IncomingForm } from 'formidable';
import type { IncomingMessage } from 'http';

/**
 * Tests detection of formidable usage via IncomingForm instances.
 * Should detect missing error handling on instance methods.
 */

class FileUploadHandler {
  private form: IncomingForm;

  constructor() {
    this.form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFields: 100
    });
  }

  // ❌ Missing error handling - should trigger violation
  async handleUpload(req: IncomingMessage) {
    const [fields, files] = await this.form.parse(req);
    return { fields, files };
  }

  // ✅ Proper error handling
  async handleUploadWithErrorHandling(req: IncomingMessage) {
    try {
      const [fields, files] = await this.form.parse(req);
      return { success: true, fields, files };
    } catch (error) {
      console.error('Upload failed:', error);
      return { success: false, error };
    }
  }
}

// ❌ Direct instance usage without error handling
async function directInstanceUsage(req: IncomingMessage) {
  const form = new IncomingForm();
  const [fields, files] = await form.parse(req);
  return files;
}
