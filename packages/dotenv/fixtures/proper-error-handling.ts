/**
 * PROPER ERROR HANDLING - This file demonstrates CORRECT dotenv usage
 * Should produce: 0 violations
 */

import * as dotenv from 'dotenv';

/**
 * ✅ CORRECT: Check result.error after config()
 */
function loadEnvironmentWithErrorHandling() {
  const result = dotenv.config();

  if (result.error) {
    throw new Error(`Failed to load .env file: ${result.error.message}`);
  }

  console.log('Environment loaded successfully');
  return result.parsed;
}

/**
 * ✅ CORRECT: Validate required environment variables
 */
function validateRequiredVariables() {
  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return { apiKey, dbUrl };
}

/**
 * ✅ CORRECT: parse() wrapped in try-catch
 */
function parseEnvStringWithErrorHandling(envString: string) {
  try {
    const config = dotenv.parse(envString);
    return config;
  } catch (error) {
    console.error('Failed to parse .env string:', error);
    throw error;
  }
}

/**
 * ✅ CORRECT: Custom path with error handling
 */
function loadCustomPathWithErrorHandling() {
  const result = dotenv.config({ path: '/custom/.env' });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new Error('Custom .env file not found at /custom/.env');
    }
    throw result.error;
  }

  return result.parsed;
}

/**
 * ✅ CORRECT: Multiple environment files with error handling
 */
function loadMultipleEnvFiles() {
  const env = process.env.NODE_ENV || 'development';
  const envPath = `.env.${env}`;

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(`Failed to load ${envPath}, falling back to .env`);
    const fallbackResult = dotenv.config();

    if (fallbackResult.error) {
      throw new Error('No .env file found');
    }
  }

  return result.parsed;
}

/**
 * ✅ CORRECT: Override mode with error handling
 */
function loadWithOverride() {
  const result = dotenv.config({ override: true });

  if (result.error) {
    throw new Error(`Failed to load .env with override: ${result.error.message}`);
  }

  return result.parsed;
}

/**
 * ✅ CORRECT: Debug mode with error handling
 */
function loadWithDebug() {
  const result = dotenv.config({ debug: true });

  if (result.error) {
    // Debug mode will log the error, but we still handle it
    throw result.error;
  }

  return result.parsed;
}

/**
 * ✅ CORRECT: Validate all variables before proceeding
 */
function startApplicationWithValidation() {
  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }

  // Validate all required variables
  const required = ['API_KEY', 'DATABASE_URL', 'JWT_SECRET', 'PORT'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('All required environment variables are present');
}

/**
 * ✅ CORRECT: Type-safe access with validation
 */
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value;
}

/**
 * ✅ CORRECT: Optional variable with default
 */
function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// Run proper initialization
loadEnvironmentWithErrorHandling();
validateRequiredVariables();
