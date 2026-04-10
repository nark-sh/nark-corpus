/**
 * Proper Error Handling Example for BullMQ
 *
 * This file demonstrates CORRECT error handling patterns.
 * Should produce 0 violations.
 */

import { Queue, Worker, QueueEvents } from 'bullmq';

// ✅ Proper: Queue.add() with try-catch
async function addJobWithErrorHandling() {
  const queue = new Queue('myQueue', {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  });

  try {
    await queue.add('job-name', { foo: 'bar' });
    console.log('Job added successfully');
  } catch (error) {
    console.error('Failed to add job:', error);
    // Handle Redis connection errors
  } finally {
    await queue.close();
  }
}

// ✅ Proper: Queue.addBulk() with try-catch
async function addBulkJobsWithErrorHandling() {
  const queue = new Queue('myQueue');

  try {
    const jobs = [
      { name: 'job1', data: { id: 1 } },
      { name: 'job2', data: { id: 2 } },
    ];

    await queue.addBulk(jobs);
    console.log('Bulk jobs added successfully');
  } catch (error) {
    console.error('Failed to add bulk jobs:', error);
  } finally {
    await queue.close();
  }
}

// ✅ Proper: Worker with error event handlers
async function createWorkerWithErrorHandling() {
  const worker = new Worker('myQueue', async (job) => {
    // Process job
    return { result: 'success' };
  });

  // Attach error event handler
  worker.on('error', (error) => {
    console.error('Worker error:', error);
  });

  worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
  });

  return worker;
}

// ✅ Proper: Connection cleanup with try-catch
async function cleanupWithErrorHandling(queue: Queue, worker: Worker) {
  try {
    await queue.close();
    await worker.close();
    console.log('Connections closed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// ✅ Proper: Fast-fail configuration
async function createQueueWithFastFail() {
  const queue = new Queue('myQueue', {
    connection: {
      host: 'localhost',
      port: 6379,
      enableOfflineQueue: false, // Fail fast if Redis is down
      maxRetriesPerRequest: 1,
    },
  });

  try {
    await queue.add('job', { data: 'test' });
  } catch (error) {
    console.error('Redis is unavailable:', error);
    throw error;
  }
}

export {
  addJobWithErrorHandling,
  addBulkJobsWithErrorHandling,
  createWorkerWithErrorHandling,
  cleanupWithErrorHandling,
  createQueueWithFastFail,
};
