import * as fs from 'fs';
import unzipper from 'unzipper';

// Proper error handling with error listener
async function extractZip() {
  fs.createReadStream('archive.zip')
    .pipe(unzipper.Extract({ path: 'output' }))
    .on('error', (err) => {
      console.error('Extraction failed:', err);
    });
}

// Proper error handling with try-catch
async function parseZip() {
  try {
    const directory = await unzipper.Open.file('archive.zip');
    return directory.files;
  } catch (error) {
    console.error('Failed to open ZIP:', error);
    throw error;
  }
}
