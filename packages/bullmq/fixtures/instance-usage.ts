/**
 * Instance Usage Example for BullMQ
 *
 * Tests detection via class instances.
 * Demonstrates various patterns of Queue and Worker usage.
 */

import { Queue, Worker, QueueEvents } from 'bullmq';

class JobService {
  private queue: Queue;
  private worker: Worker;
  private queueEvents: QueueEvents;

  constructor() {
    // Create Queue instance
    this.queue = new Queue('jobs', {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    });

    // Create Worker instance
    this.worker = new Worker('jobs', async (job) => {
      return this.processJob(job);
    });

    // Create QueueEvents instance
    this.queueEvents = new QueueEvents('jobs');
  }

  // ❌ No try-catch on instance method
  async addJob(name: string, data: any): Promise<void> {
    await this.queue.add(name, data);
  }

  // ❌ No try-catch on bulk operation
  async addMultipleJobs(jobs: Array<{ name: string; data: any }>): Promise<void> {
    await this.queue.addBulk(jobs);
  }

  // ❌ No error handling in processor
  private async processJob(job: any): Promise<any> {
    console.log('Processing job:', job.id);
    return { result: 'success' };
  }

  // ❌ No try-catch on cleanup
  async cleanup(): Promise<void> {
    await this.queue.close();
    await this.worker.close();
    await this.queueEvents.close();
  }
}

class EmailQueueService {
  private emailQueue: Queue;

  constructor() {
    this.emailQueue = new Queue('emails');
  }

  // ❌ No try-catch
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.emailQueue.add('send-email', {
      to,
      subject,
      body,
    });
  }

  // ❌ No try-catch on scheduled job
  async scheduleEmail(to: string, sendAt: Date): Promise<void> {
    await this.emailQueue.add(
      'scheduled-email',
      { to },
      {
        delay: sendAt.getTime() - Date.now(),
      }
    );
  }
}

// Test instance detection
async function testJobService() {
  const service = new JobService();

  // ❌ No try-catch
  await service.addJob('welcome-email', {
    userId: 123,
    template: 'welcome',
  });

  await service.addMultipleJobs([
    { name: 'email-1', data: { id: 1 } },
    { name: 'email-2', data: { id: 2 } },
  ]);

  await service.cleanup();
}

async function testEmailQueueService() {
  const emailService = new EmailQueueService();

  // ❌ No try-catch
  await emailService.sendEmail(
    'user@example.com',
    'Welcome',
    'Welcome to our service!'
  );

  await emailService.scheduleEmail('user@example.com', new Date(Date.now() + 3600000));
}

export { JobService, EmailQueueService, testJobService, testEmailQueueService };
