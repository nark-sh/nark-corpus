/**
 * Missing Error Handling Example for BullMQ
 *
 * This file demonstrates INCORRECT patterns (missing try-catch).
 * Should produce ERROR violations.
 */

import { Queue, Worker, QueueEvents } from 'bullmq';

// ❌ Missing try-catch on Queue.add()
async function addJobWithoutErrorHandling() {
  const queue = new Queue('myQueue', {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  });

  // ❌ No try-catch - will crash if Redis is down
  await queue.add('job-name', { foo: 'bar' });
  await queue.close();
}

// ❌ Missing try-catch on Queue.addBulk()
async function addBulkJobsWithoutErrorHandling() {
  const queue = new Queue('myQueue');

  const jobs = [
    { name: 'job1', data: { id: 1 } },
    { name: 'job2', data: { id: 2 } },
  ];

  // ❌ No try-catch - will crash if Redis connection fails
  await queue.addBulk(jobs);
  await queue.close();
}

// ❌ Worker without error event handlers
async function createWorkerWithoutErrorHandling() {
  const worker = new Worker('myQueue', async (job) => {
    // Process job
    return { result: 'success' };
  });

  // ❌ No error or failed event handlers
  // Worker may stop processing if error occurs

  return worker;
}

// ❌ Connection cleanup without try-catch
async function cleanupWithoutErrorHandling(queue: Queue, worker: Worker) {
  // ❌ No try-catch - cleanup errors not handled
  await queue.close();
  await worker.close();
}

// ❌ Multiple operations without error handling
async function processJobsWithoutErrorHandling() {
  const queue = new Queue('taskQueue');

  // ❌ No try-catch on add operations
  await queue.add('email', { to: 'user@example.com' });
  await queue.add('notification', { message: 'Hello' });

  const worker = new Worker('taskQueue', async (job) => {
    console.log('Processing:', job.name);
    return { status: 'done' };
  });

  // ❌ No error handlers on worker
  // ❌ No cleanup handling
}

// ❌ Chained operations without error handling
async function chainedOperationsWithoutErrorHandling() {
  const queue = new Queue('pipeline');

  // ❌ No try-catch on any of these operations
  await queue.add('step1', { data: 1 });
  await queue.add('step2', { data: 2 });
  await queue.add('step3', { data: 3 });

  await queue.close();
}

export {
  addJobWithoutErrorHandling,
  addBulkJobsWithoutErrorHandling,
  createWorkerWithoutErrorHandling,
  cleanupWithoutErrorHandling,
  processJobsWithoutErrorHandling,
  chainedOperationsWithoutErrorHandling,
};
