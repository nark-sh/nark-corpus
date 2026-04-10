import * as fs from 'fs';
import unzipper from 'unzipper';

// Missing error handling - no error handler
async function extractZip() {
  fs.createReadStream('archive.zip')
    .pipe(unzipper.Extract({ path: 'output' }));
}

// Missing error handling - no catch
async function parseZip() {
  const directory = await unzipper.Open.file('archive.zip');
  return directory.files;
}
