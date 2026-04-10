import nodemailer from 'nodemailer';

/**
 * Missing error handling for nodemailer.sendMail()
 * Should trigger ERROR violation.
 */
async function sendEmailWithoutErrorHandling() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'user@example.com',
      pass: 'password'
    }
  });

  // ❌ No try-catch
  const info = await transporter.sendMail({
    from: '"Sender" <sender@example.com>',
    to: 'recipient@example.com',
    subject: 'Test',
    text: 'Hello world'
  });
  console.log('Message sent:', info.messageId);
}
