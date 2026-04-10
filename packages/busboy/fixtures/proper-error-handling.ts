import Busboy from 'busboy';
import type { IncomingMessage } from 'http';

// Proper error handling with error listener
function handleUpload(req: IncomingMessage) {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on('error', (error) => {
    console.error('Busboy error:', error);
  });

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
