/**
 * nodemailer Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "nodemailer"):
 *   - nodemailer.createTransport()   postcondition: configuration-error
 *   - transporter.sendMail()         postcondition: connection-error
 *   - nodemailer.createTestAccount() postconditions: create-test-account-network-error,
 *                                                    create-test-account-api-error,
 *                                                    create-test-account-parse-error
 *
 * Detection path: createTransport/sendMail/createTestAccount in async handler function →
 *   ThrowingFunctionDetector fires call →
 *   ContractMatcher checks try-catch → postcondition fires
 *
 * NOTE: These violations only fire when ground-truth.ts is analyzed in isolation
 * (single-file tsconfig). When analyzed alongside other fixture files, the
 * multi-file TypeScript program produces different detection results.
 */

import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// 1. nodemailer.createTransport() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export const sendEmailNoCatch = async (event: any) => {
  // SHOULD_FIRE: configuration-error — createTransport() throws on invalid config. No try-catch.
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: { user: 'user', pass: 'pass' }
  });
  // SHOULD_FIRE: connection-error — sendMail() rejects on SMTP connection errors. No try-catch.
  transporter.sendMail({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Test'
  });
  return { statusCode: 200 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Both inside try-catch — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export const sendEmailWithCatch = async (event: any) => {
  try {
    // SHOULD_NOT_FIRE: createTransport() inside try-catch satisfies error handling
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      auth: { user: 'user', pass: 'pass' }
    });
    // SHOULD_NOT_FIRE: sendMail() inside try-catch satisfies error handling
    await transporter.sendMail({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test'
    });
    return { statusCode: 200 };
  } catch (err) {
    console.error('Send failed:', err);
    return { statusCode: 500 };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. nodemailer.createTestAccount() — without try-catch (scanner concern queued)
//    NOTE: createTestAccount() detection rule not yet in scanner.
//    Annotations are spec-driven; will pass once scanner concern is implemented.
// ─────────────────────────────────────────────────────────────────────────────

export const setupTestEmailNoCatch = async () => {
  // SHOULD_FIRE: create-test-account-network-error — createTestAccount() makes HTTP call to Ethereal API, can throw network errors without try-catch
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transporter;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. nodemailer.createTestAccount() — with proper error handling
// ─────────────────────────────────────────────────────────────────────────────

export const setupTestEmailWithCatch = async () => {
  try {
    // SHOULD_NOT_FIRE: createTestAccount() inside try-catch satisfies error handling for all three error types
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return transporter;
  } catch (err) {
    // Handle network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND),
    // API errors (data.status !== 'success'), and JSON parse errors (SyntaxError)
    console.error('Failed to create test account:', err);
    throw new Error('Email test setup failed — Ethereal API may be unavailable');
  }
};
