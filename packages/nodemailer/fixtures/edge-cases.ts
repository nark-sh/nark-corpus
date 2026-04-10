import nodemailer from 'nodemailer';

/**
 * Edge cases and common production bugs for nodemailer.
 */

// ❌ EDGE CASE 1: Missing await in serverless (MOST COMMON BUG - 30-40% of issues)
export const lambdaHandlerWrong = async (event: any) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: { user: 'user', pass: 'pass' }
  });

  // ❌ Missing await - function exits before email sends!
  transporter.sendMail({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Test'
  });

  return { statusCode: 200 }; // Returns before email is sent!
};

// ✅ CORRECT: Properly awaited in serverless
export const lambdaHandlerCorrect = async (event: any) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: { user: 'user', pass: 'pass' }
  });

  try {
    await transporter.sendMail({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test'
    });
    return { statusCode: 200 };
  } catch (error) {
    console.error('Email failed:', error);
    return { statusCode: 500 };
  }
};

// ❌ EDGE CASE 2: No input validation (SECURITY - CVE-2021-23400)
async function sendEmailWithUserInput(userEmail: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587
  });

  // ❌ No sanitization - vulnerable to header injection
  // User could pass: "victim@example.com\r\nBcc: attacker@evil.com"
  await transporter.sendMail({
    from: 'sender@example.com',
    to: userEmail, // VULNERABLE!
    subject: 'Hello'
  });
}

// ✅ CORRECT: Sanitized input
async function sendEmailSanitized(userEmail: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587
  });

  // ✅ Sanitize to prevent CVE-2021-23400
  const sanitizedEmail = userEmail.replace(/[\r\n]/g, '');

  try {
    await transporter.sendMail({
      from: 'sender@example.com',
      to: sanitizedEmail,
      subject: 'Hello'
    });
  } catch (error) {
    console.error('Failed to send:', error);
    throw error;
  }
}

// ❌ EDGE CASE 3: Creating new transporter each time (PERFORMANCE)
async function sendManyEmailsWrong() {
  for (let i = 0; i < 100; i++) {
    // ❌ Creates new transporter every iteration - very slow!
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587
    });

    await transporter.sendMail({
      to: `user${i}@example.com`,
      subject: 'Test'
    });
  }
}

// ✅ CORRECT: Reuse transporter
async function sendManyEmailsCorrect() {
  // ✅ Create once, reuse for all emails
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    pool: true // Enable connection pooling
  });

  try {
    for (let i = 0; i < 100; i++) {
      await transporter.sendMail({
        to: `user${i}@example.com`,
        subject: 'Test'
      });
    }
  } catch (error) {
    console.error('Batch send failed:', error);
    throw error;
  }
}

// ❌ EDGE CASE 4: Not checking info.rejected (SILENT FAILURES)
async function sendEmailIgnoreRejected() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587
  });

  try {
    const info = await transporter.sendMail({
      from: 'sender@example.com',
      to: ['user1@example.com', 'invalid', 'user2@example.com'],
      subject: 'Test'
    });
    // ❌ Not checking info.rejected - partial failure goes unnoticed
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed:', error);
  }
}

// ✅ CORRECT: Check rejected recipients
async function sendEmailCheckRejected() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587
  });

  try {
    const info = await transporter.sendMail({
      from: 'sender@example.com',
      to: ['user1@example.com', 'invalid', 'user2@example.com'],
      subject: 'Test'
    });

    // ✅ Check for partial failures
    if (info.rejected.length > 0) {
      console.error('Some recipients rejected:', info.rejected);
      if (info.rejectedErrors) {
        console.error('Rejection details:', info.rejectedErrors);
      }
    }

    console.log('Sent to:', info.accepted);
  } catch (error) {
    console.error('Failed:', error);
  }
}

// ❌ EDGE CASE 5: Wrong retry strategy (retrying non-retriable errors)
async function sendEmailWrongRetry() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await transporter.sendMail({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test'
      });
      break;
    } catch (error: any) {
      // ❌ Retries ALL errors, even non-retriable ones like EAUTH
      console.log('Retry attempt', attempt);
      if (attempt === 2) throw error;
    }
  }
}

// ✅ CORRECT: Only retry retriable errors
async function sendEmailCorrectRetry() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587
  });

  const retriableErrors = ['ECONNECTION', 'ETIMEDOUT', 'EDNS', 'ESOCKET'];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await transporter.sendMail({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test'
      });
      break; // Success
    } catch (error: any) {
      // ✅ Only retry transient network errors
      if (!retriableErrors.includes(error.code) || attempt === 2) {
        throw error; // Fail fast on auth/config errors
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// ❌ EDGE CASE 6: Not calling verify() before production
async function deployWithoutVerify() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: { user: 'wrong', pass: 'credentials' } // Wrong credentials!
  });

  // ❌ No verify() call - will discover config error when first email is sent
  // (possibly in production with real users)
}

// ✅ CORRECT: Verify during startup
async function deployWithVerify() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: { user: 'user', pass: 'password' }
  });

  try {
    // ✅ Verify configuration during startup
    await transporter.verify();
    console.log('SMTP server ready - safe to accept requests');
  } catch (error) {
    console.error('SMTP configuration error - aborting startup:', error);
    process.exit(1); // Fail fast
  }
}
