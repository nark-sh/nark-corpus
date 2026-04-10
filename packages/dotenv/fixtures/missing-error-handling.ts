/**
 * MISSING ERROR HANDLING - This file demonstrates INCORRECT dotenv usage
 * Should produce: Multiple ERROR violations
 */

import * as dotenv from 'dotenv';

/**
 * ❌ VIOLATION: No error handling on config()
 * Bug: If .env file missing or has parse errors, failures are silent
 */
function loadEnvironmentNoErrorHandling() {
  dotenv.config();
  // No error checking - violation!
  console.log('Environment loaded (maybe)');
}

/**
 * ❌ VIOLATION: Result assigned but error not checked
 */
function loadEnvironmentResultNotChecked() {
  const result = dotenv.config();
  // result.error never checked - violation!
  console.log('Loaded:', result.parsed);
}

/**
 * ❌ VIOLATION: No validation of required variables
 */
function useEnvironmentVariablesWithoutValidation() {
  dotenv.config();

  // ❌ No validation that API_KEY is defined
  const apiKey = process.env.API_KEY;
  console.log('API Key:', apiKey); // Could be undefined!

  // ❌ No validation that DATABASE_URL is defined
  const dbUrl = process.env.DATABASE_URL;
  connectToDatabase(dbUrl); // Crash if undefined!
}

/**
 * ❌ VIOLATION: parse() without try-catch
 */
function parseEnvStringNoTryCatch(envString: string) {
  // parse() throws on error - violation!
  const config = dotenv.parse(envString);
  return config;
}

/**
 * ❌ VIOLATION: Custom path without error handling
 */
function loadCustomPathNoErrorHandling() {
  dotenv.config({ path: '/custom/.env' });
  // No error handling - violation!
  // File might not exist, parse might fail
}

/**
 * ❌ VIOLATION: Multiple issues in Express-style app
 */
function startExpressApp() {
  // ❌ No error handling
  dotenv.config();

  // ❌ No validation
  const port = process.env.PORT;
  const apiUrl = process.env.API_URL;

  // ❌ Using undefined variables
  console.log(`Starting server on port ${port}`);
  console.log(`API URL: ${apiUrl}`);
}

/**
 * ❌ VIOLATION: Accessing env vars before config()
 */
const dbHost = process.env.DB_HOST; // ❌ Accessed before config()

function accessBeforeConfig() {
  // Now calling config() - too late!
  dotenv.config();

  // dbHost was captured before config(), so it's undefined
  console.log('DB Host:', dbHost);
}

/**
 * ❌ VIOLATION: No validation in production code
 */
function connectToDatabase(url: string) {
  // This will crash if url is undefined
  console.log('Connecting to:', url);
}

/**
 * ❌ VIOLATION: Silent fallback hides missing .env
 */
function loadWithSilentFallback() {
  dotenv.config();
  // ❌ Fallback hides missing .env file
  const port = process.env.PORT || 3000;

  // App runs even if PORT not defined in .env
  console.log('Port:', port);
}

/**
 * ❌ VIOLATION: Logging full error (might leak secrets)
 */
function loadAndLogError() {
  const result = dotenv.config();

  if (result.error) {
    // ❌ Logging full error might leak sensitive values
    console.error('Error loading .env:', result.error);
  }
}

/**
 * ❌ VIOLATION: Multiple environment files without validation
 */
function loadMultipleEnvFilesNoValidation() {
  const env = process.env.NODE_ENV;

  // ❌ No error handling on custom path
  dotenv.config({ path: `.env.${env}` });

  // ❌ No validation that variables loaded
  const apiKey = process.env.API_KEY;
  console.log('API Key:', apiKey);
}

/**
 * ❌ VIOLATION: Override without error handling
 */
function loadWithOverrideNoErrorHandling() {
  // ❌ No error handling
  dotenv.config({ override: true });
}

/**
 * ❌ VIOLATION: parse() in loop without try-catch
 */
function parseMultipleFilesNoTryCatch(files: string[]) {
  return files.map(file => {
    // ❌ parse() throws, no try-catch
    return dotenv.parse(file);
  });
}

/**
 * ❌ VIOLATION: Destructuring undefined env vars
 */
function destructureEnvVarsWithoutValidation() {
  dotenv.config();

  // ❌ No validation - will be undefined if missing
  const { API_KEY, DB_URL, JWT_SECRET } = process.env;

  console.log('Keys:', API_KEY, DB_URL, JWT_SECRET);
}

/**
 * ❌ VIOLATION: TypeScript ignoring undefined
 */
function typeScriptIgnoringUndefined() {
  dotenv.config();

  // ❌ Type assertion without validation
  const apiKey = process.env.API_KEY as string; // Could be undefined!

  // Will crash if API_KEY not defined
  return apiKey.toUpperCase();
}

// Run all violation examples
loadEnvironmentNoErrorHandling();
loadEnvironmentResultNotChecked();
useEnvironmentVariablesWithoutValidation();
parseEnvStringNoTryCatch('KEY=value');
loadCustomPathNoErrorHandling();
startExpressApp();
accessBeforeConfig();
