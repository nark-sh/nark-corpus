import formidable from 'formidable';
import type { IncomingMessage } from 'http';

// Proper error handling
async function handleUpload(req: IncomingMessage) {
  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    return { fields, files };
  } catch (error) {
    console.error('Form parsing failed:', error);
    throw error;
  }
}
