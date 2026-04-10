import nodemailer from 'nodemailer';

/**
 * Tests detection of nodemailer usage via instances.
 * Tests createTransport() and transporter.sendMail() patterns.
 */

// ✅ PROPER: Instance usage with error handling
class EmailService {
  private transporter: any;

  constructor() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password'
        }
      });
    } catch (error) {
      console.error('Failed to create transporter:', error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Sender" <sender@example.com>',
        to,
        subject,
        text
      });

      // Check for rejected recipients
      if (info.rejected.length > 0) {
        console.error('Some recipients rejected:', info.rejected);
      }

      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP server is ready');
    } catch (error) {
      console.error('SMTP verification failed:', error);
      throw error;
    }
  }
}

// ❌ WRONG: Instance usage without error handling
class BadEmailService {
  private transporter: any;

  constructor() {
    // ❌ No try-catch on createTransport
    this.transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      auth: {
        user: 'user@example.com',
        pass: 'password'
      }
    });
  }

  async sendEmail(to: string, subject: string) {
    // ❌ No try-catch on sendMail
    const info = await this.transporter.sendMail({
      from: 'sender@example.com',
      to,
      subject,
      text: 'Hello'
    });
    return info;
  }

  async verify() {
    // ❌ No try-catch on verify
    await this.transporter.verify();
  }
}

// ❌ WRONG: Reusable transporter but no error handling
const globalTransporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587
});

async function sendGlobalEmail() {
  // ❌ No try-catch
  await globalTransporter.sendMail({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Test'
  });
}
