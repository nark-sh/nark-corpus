'use strict';

const fs = require('fs');
const path = require('path');

// Resolve paths relative to this script file
const SCHEMA_PATH = path.join(__dirname, '..', 'schema', 'contract.schema.json');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

// Load AJV and yaml — must be installed in corpus package
let Ajv, yaml;
try {
  Ajv = require('ajv');
} catch (e) {
  console.error('ERROR: ajv not found. Run: cd packages/corpus && npm install');
  process.exit(2);
}
try {
  yaml = require('yaml');
} catch (e) {
  console.error('ERROR: yaml not found. Run: cd packages/corpus && npm install');
  process.exit(2);
}

// Load schema
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// Initialize AJV
const AjvClass = typeof Ajv === 'function' ? Ajv : Ajv.default;
const ajv = new AjvClass({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

/**
 * Recursively walk a directory and collect all files named contract.yaml.
 * Handles scoped packages (two directory levels deep, e.g. @clerk/nextjs).
 */
function findContractFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden directories (e.g. .bak, .disabled backup dirs)
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      const nested = findContractFiles(fullPath);
      results.push(...nested);
    } else if (entry.isFile() && entry.name === 'contract.yaml') {
      results.push(fullPath);
    }
  }

  return results;
}

// Find all contract.yaml files
const contractFiles = findContractFiles(PACKAGES_DIR).sort();

if (contractFiles.length === 0) {
  console.error('ERROR: No contract.yaml files found in ' + PACKAGES_DIR);
  process.exit(2);
}

let passCount = 0;
let failCount = 0;

for (const filePath of contractFiles) {
  // Compute a relative path for display (relative to the packages dir parent = corpus root)
  const corpusRoot = path.join(__dirname, '..');
  const relPath = path.relative(corpusRoot, filePath);

  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    data = yaml.parse(content);
  } catch (parseErr) {
    console.log('FAIL  ' + relPath);
    console.log('      -> YAML parse error: ' + parseErr.message);
    failCount++;
    continue;
  }

  const valid = validate(data);

  if (valid) {
    console.log('PASS  ' + relPath);
    passCount++;
  } else {
    console.log('FAIL  ' + relPath);
    for (const err of validate.errors) {
      const location = err.instancePath || '(root)';
      console.log('      -> ' + location + ': ' + err.message);
    }
    failCount++;
  }
}

// Summary
console.log('');
if (failCount === 0) {
  console.log('All ' + passCount + ' contracts valid');
} else {
  console.log(passCount + ' passed, ' + failCount + ' failed');
}

process.exit(failCount > 0 ? 1 : 0);
