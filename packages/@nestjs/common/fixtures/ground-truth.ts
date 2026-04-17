/**
 * Ground-truth fixtures for @nestjs/common pipe postconditions.
 * These test the async pipe transform() methods added in the depth pass (2026-04-17).
 *
 * Postcondition IDs tested:
 *   - validation-pipe-missing-peer-deps      (ValidationPipe without class-validator installed)
 *   - validation-pipe-dto-validation-error   (ValidationPipe rejects invalid DTO)
 *   - parse-int-invalid-input                (ParseIntPipe with non-integer string)
 *   - parse-bool-invalid-input               (ParseBoolPipe with "1"/"0"/"yes")
 *   - parse-uuid-invalid-format              (ParseUUIDPipe with non-UUID string)
 *   - parse-array-missing-or-invalid         (ParseArrayPipe with missing required array)
 *   - parse-float-invalid-input              (ParseFloatPipe with non-numeric string)
 *   - parse-enum-invalid-value               (ParseEnumPipe with out-of-enum value)
 *   - parse-file-missing-required            (ParseFilePipe when no file uploaded)
 *   - parse-file-validator-failed            (ParseFilePipe when MaxFileSizeValidator fails)
 */

import {
  ValidationPipe,
  ParseIntPipe,
  ParseBoolPipe,
  ParseUUIDPipe,
  ParseArrayPipe,
  ParseFloatPipe,
  ParseEnumPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';

const mockMetadata = { type: 'query', data: 'param', metatype: String } as any;

// ─── ValidationPipe ────────────────────────────────────────────────────────────

// @expect-violation: validation-pipe-dto-validation-error
async function validateDtoMissingErrorHandling() {
  const pipe = new ValidationPipe({ whitelist: true });
  // ❌ No try-catch — BadRequestException if DTO validation fails
  const result = await pipe.transform({ email: 'not-an-email' }, mockMetadata);
  return result;
}

// @expect-clean
async function validateDtoWithErrorHandling() {
  const pipe = new ValidationPipe({ whitelist: true });
  try {
    const result = await pipe.transform({ email: 'not-an-email' }, mockMetadata);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      throw new Error(`Validation failed: ${JSON.stringify(response)}`);
    }
    throw error;
  }
}

// ─── ParseIntPipe ───────────────────────────────────────────────────────────────

// @expect-violation: parse-int-invalid-input
async function parseIntNoErrorHandling() {
  const pipe = new ParseIntPipe();
  // ❌ No try-catch — BadRequestException if value is not a numeric integer string
  const result = await pipe.transform('abc', mockMetadata);
  return result;
}

// @expect-clean
async function parseIntWithErrorHandling() {
  const pipe = new ParseIntPipe();
  try {
    const result = await pipe.transform('abc', mockMetadata);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Invalid integer parameter');
    }
    throw error;
  }
}

// ─── ParseBoolPipe ──────────────────────────────────────────────────────────────

// @expect-violation: parse-bool-invalid-input
async function parseBoolNoErrorHandling() {
  const pipe = new ParseBoolPipe();
  // ❌ No try-catch — "1", "0", "yes", "no" all throw BadRequestException
  const result = await pipe.transform('yes', mockMetadata);
  return result;
}

// @expect-clean
async function parseBoolWithErrorHandling() {
  const pipe = new ParseBoolPipe();
  try {
    const result = await pipe.transform('yes', mockMetadata);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Invalid boolean parameter — use "true" or "false"');
    }
    throw error;
  }
}

// ─── ParseUUIDPipe ──────────────────────────────────────────────────────────────

// @expect-violation: parse-uuid-invalid-format
async function parseUUIDNoErrorHandling() {
  const pipe = new ParseUUIDPipe({ version: '4' });
  // ❌ No try-catch — numeric IDs or malformed UUIDs throw BadRequestException
  const result = await pipe.transform('123', mockMetadata);
  return result;
}

// @expect-clean
async function parseUUIDWithErrorHandling() {
  const pipe = new ParseUUIDPipe({ version: '4' });
  try {
    const result = await pipe.transform('123', mockMetadata);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Invalid UUID parameter');
    }
    throw error;
  }
}

// ─── ParseArrayPipe ─────────────────────────────────────────────────────────────

// @expect-violation: parse-array-missing-or-invalid
async function parseArrayNoErrorHandling() {
  const pipe = new ParseArrayPipe();
  // ❌ No try-catch — undefined/null throws when fileIsRequired (default true)
  const result = await pipe.transform(undefined, mockMetadata);
  return result;
}

// @expect-clean
async function parseArrayWithErrorHandling() {
  const pipe = new ParseArrayPipe({ optional: true });
  try {
    const result = await pipe.transform(undefined, mockMetadata);
    return result; // returns undefined when optional: true
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Invalid array parameter');
    }
    throw error;
  }
}

// ─── ParseFloatPipe ─────────────────────────────────────────────────────────────

// @expect-violation: parse-float-invalid-input
async function parseFloatNoErrorHandling() {
  const pipe = new ParseFloatPipe();
  // ❌ No try-catch — non-numeric strings throw BadRequestException
  const result = await pipe.transform('price', mockMetadata);
  return result;
}

// @expect-clean
async function parseFloatWithErrorHandling() {
  const pipe = new ParseFloatPipe();
  try {
    const result = await pipe.transform('price', mockMetadata);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Invalid float parameter');
    }
    throw error;
  }
}

// ─── ParseEnumPipe ──────────────────────────────────────────────────────────────

enum Direction { ASC = 'ASC', DESC = 'DESC' }

// @expect-violation: parse-enum-invalid-value
async function parseEnumNoErrorHandling() {
  const pipe = new ParseEnumPipe(Direction);
  // ❌ No try-catch — "asc" (lowercase) throws BadRequestException for string enum
  const result = await pipe.transform('asc' as Direction, mockMetadata);
  return result;
}

// @expect-clean
async function parseEnumWithErrorHandling() {
  const pipe = new ParseEnumPipe(Direction);
  try {
    const result = await pipe.transform('asc' as Direction, mockMetadata);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Invalid direction parameter — use "ASC" or "DESC"');
    }
    throw error;
  }
}

// ─── ParseFilePipe ──────────────────────────────────────────────────────────────

// @expect-violation: parse-file-missing-required
async function parseFileMissingNoErrorHandling() {
  const pipe = new ParseFilePipe(); // fileIsRequired: true by default
  // ❌ No try-catch — undefined throws "File is required"
  const result = await pipe.transform(undefined);
  return result;
}

// @expect-violation: parse-file-validator-failed
async function parseFileValidatorNoErrorHandling(file: Express.Multer.File) {
  const pipe = new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1024 }), // 1KB limit
    ],
  });
  // ❌ No try-catch — oversized files throw BadRequestException
  const result = await pipe.transform(file);
  return result;
}

// @expect-clean
async function parseFileWithErrorHandling(file: Express.Multer.File | undefined) {
  const pipe = new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
      new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
    ],
  });
  try {
    const result = await pipe.transform(file);
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      const response = error.getResponse() as any;
      throw new Error(`File upload rejected: ${response.message}`);
    }
    throw error;
  }
}
