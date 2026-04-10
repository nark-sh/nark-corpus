import formidable from 'formidable';
import type { IncomingMessage } from 'http';

// Missing error handling - parse can fail
async function handleUpload(req: IncomingMessage) {
  const form = formidable({});
  const [fields, files] = await form.parse(req);
  return { fields, files };
}
