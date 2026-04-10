import Busboy from 'busboy';
import type { IncomingMessage } from 'http';

// Missing error handling - no error listener
function handleUpload(req: IncomingMessage) {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on('file', (fieldname, file, filename) => {
    file.on('data', (data) => {
      console.log('File data:', data.length);
    });
    file.on('end', () => {
      console.log('File upload complete');
    });
  });

  req.pipe(busboy);
}
