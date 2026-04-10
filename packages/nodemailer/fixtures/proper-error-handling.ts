import nodemailer from 'nodemailer';

/**
 * Proper error handling for nodemailer.sendMail()
 * Should NOT trigger violations.
 */
async function sendEmailWithErrorHandling() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'user@example.com',
      pass: 'password'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Sender" <sender@example.com>',
      to: 'recipient@example.com',
      subject: 'Test',
      text: 'Hello world'
    });
    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
