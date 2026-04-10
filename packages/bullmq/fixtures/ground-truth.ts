/**
 * bullmq Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "bullmq"):
 *   - queue.add()              postcondition: queue-add-redis-error
 *   - queue.addBulk()          postcondition: queue-addbulk-redis-error
 *   - worker processor         postcondition: worker-process-job-error
 *   - close()                  postcondition: close-error
 *   - worker.run()             postcondition: worker-run-no-error-listener, worker-run-redis-connection-error
 *   - flowProducer.add()       postcondition: flow-add-redis-error
 *   - flowProducer.addBulk()   postcondition: flow-addbulk-redis-error
 *   - upsertJobScheduler()     postcondition: scheduler-upsert-redis-error
 *   - pause()                  postcondition: queue-pause-redis-error
 *   - resume()                 postcondition: queue-resume-redis-error
 *   - obliterate()             postcondition: queue-obliterate-active-jobs-error
 *   - waitUntilFinished()      postcondition: job-wait-until-finished-timeout, job-wait-until-finished-job-failed
 *   - job.remove()             postcondition: job-remove-locked-error
 *   - job.retry()              postcondition: job-retry-invalid-state
 *   - clean()                  postcondition: queue-clean-redis-error
 *   - drain()                  postcondition: queue-drain-redis-error
 *   - retryJobs()              postcondition: queue-retryjobs-redis-error
 *
 * Detection path: new Queue/Worker/FlowProducer() → InstanceTracker tracks instance →
 *   ThrowingFunctionDetector fires method() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { Queue, Worker, FlowProducer, QueueEvents, Job } from 'bullmq';

// ─────────────────────────────────────────────────────────────────────────────
// 1. queue.add() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function addJobNoCatch(name: string, data: unknown) {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-add-redis-error — queue.add() throws on Redis connection errors. No try-catch.
  await queue.add(name, data);
  await queue.close();
}

export async function addJobWithCatch(name: string, data: unknown) {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: queue.add() inside try-catch satisfies error handling
    await queue.add(name, data);
  } catch (err) {
    console.error('Add job failed:', err);
    throw err;
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. queue.addBulk() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function addBulkNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-addbulk-redis-error — addBulk() throws on Redis errors. No try-catch.
  await queue.addBulk([
    { name: 'job1', data: { foo: 1 } },
    { name: 'job2', data: { foo: 2 } },
  ]);
  await queue.close();
}

export async function addBulkWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: addBulk() inside try-catch
    await queue.addBulk([
      { name: 'job1', data: { foo: 1 } },
      { name: 'job2', data: { foo: 2 } },
    ]);
  } catch (err) {
    console.error('Bulk add failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FlowProducer.add() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function flowAddNoCatch() {
  const flow = new FlowProducer();
  // SHOULD_FIRE: flow-add-redis-error — FlowProducer.add() throws on Redis errors. No try-catch.
  await flow.add({
    name: 'parent',
    queueName: 'parentQueue',
    data: {},
    children: [
      { name: 'child1', queueName: 'childQueue', data: {} },
    ],
  });
  await flow.close();
}

export async function flowAddWithCatch() {
  const flow = new FlowProducer();
  try {
    // SHOULD_NOT_FIRE: FlowProducer.add() inside try-catch
    await flow.add({
      name: 'parent',
      queueName: 'parentQueue',
      data: {},
      children: [
        { name: 'child1', queueName: 'childQueue', data: {} },
      ],
    });
  } catch (err) {
    console.error('Flow add failed:', err);
  } finally {
    await flow.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FlowProducer.addBulk() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function flowAddBulkNoCatch() {
  const flow = new FlowProducer();
  // SHOULD_FIRE: flow-addbulk-redis-error — FlowProducer.addBulk() throws on Redis errors. No try-catch.
  await flow.addBulk([
    { name: 'parent1', queueName: 'q1', data: {} },
    { name: 'parent2', queueName: 'q2', data: {} },
  ]);
  await flow.close();
}

export async function flowAddBulkWithCatch() {
  const flow = new FlowProducer();
  try {
    // SHOULD_NOT_FIRE: FlowProducer.addBulk() inside try-catch
    await flow.addBulk([
      { name: 'parent1', queueName: 'q1', data: {} },
      { name: 'parent2', queueName: 'q2', data: {} },
    ]);
  } catch (err) {
    console.error('Flow addBulk failed:', err);
  } finally {
    await flow.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. queue.upsertJobScheduler() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertSchedulerNoCatch() {
  const queue = new Queue('scheduled');
  // SHOULD_FIRE: scheduler-upsert-redis-error — upsertJobScheduler() throws on Redis errors. No try-catch.
  await queue.upsertJobScheduler('my-cron', { every: 60000 });
  await queue.close();
}

export async function upsertSchedulerWithCatch() {
  const queue = new Queue('scheduled');
  try {
    // SHOULD_NOT_FIRE: upsertJobScheduler() inside try-catch
    await queue.upsertJobScheduler('my-cron', { every: 60000 });
  } catch (err) {
    console.error('Scheduler upsert failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. queue.pause() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function pauseNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-pause-redis-error — pause() throws on Redis errors. No try-catch.
  await queue.pause();
  await queue.close();
}

export async function pauseWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: pause() inside try-catch
    await queue.pause();
  } catch (err) {
    console.error('Pause failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. queue.resume() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function resumeNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-resume-redis-error — resume() throws on Redis errors. No try-catch.
  await queue.resume();
  await queue.close();
}

export async function resumeWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: resume() inside try-catch
    await queue.resume();
  } catch (err) {
    console.error('Resume failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. queue.obliterate() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function obliterateNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-obliterate-active-jobs-error — obliterate() throws on active jobs. No try-catch.
  await queue.obliterate();
  await queue.close();
}

export async function obliterateWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: obliterate() inside try-catch
    await queue.obliterate();
  } catch (err) {
    console.error('Obliterate failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. job.waitUntilFinished() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function waitUntilFinishedNoCatch() {
  const queue = new Queue('jobs');
  const queueEvents = new QueueEvents('jobs');
  const job = await queue.add('test', { data: 1 });
  // SHOULD_FIRE: job-wait-until-finished-timeout — waitUntilFinished() rejects on timeout. No try-catch.
  // SHOULD_FIRE: job-wait-until-finished-job-failed — waitUntilFinished() rejects on job failure. No try-catch.
  const result = await job.waitUntilFinished(queueEvents, 5000);
  await queue.close();
  await queueEvents.close();
}

export async function waitUntilFinishedWithCatch() {
  const queue = new Queue('jobs');
  const queueEvents = new QueueEvents('jobs');
  const job = await queue.add('test', { data: 1 });
  try {
    // SHOULD_NOT_FIRE: waitUntilFinished() inside try-catch
    const result = await job.waitUntilFinished(queueEvents, 5000);
  } catch (err) {
    console.error('Job failed or timed out:', err);
  } finally {
    await queue.close();
    await queueEvents.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. job.remove() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function jobRemoveNoCatch(job: Job) {
  // SHOULD_FIRE: job-remove-locked-error — job.remove() throws on locked jobs. No try-catch.
  await job.remove();
}

export async function jobRemoveWithCatch(job: Job) {
  try {
    // SHOULD_NOT_FIRE: job.remove() inside try-catch
    await job.remove();
  } catch (err) {
    console.error('Job remove failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. job.retry() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function jobRetryNoCatch(job: Job) {
  // SHOULD_FIRE: job-retry-invalid-state — job.retry() throws on wrong state. No try-catch.
  await job.retry();
}

export async function jobRetryWithCatch(job: Job) {
  try {
    // SHOULD_NOT_FIRE: job.retry() inside try-catch
    await job.retry();
  } catch (err) {
    console.error('Job retry failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. queue.clean() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function cleanNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-clean-redis-error — clean() throws on Redis errors. No try-catch.
  await queue.clean(60000, 100, 'completed');
  await queue.close();
}

export async function cleanWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: clean() inside try-catch
    await queue.clean(60000, 100, 'completed');
  } catch (err) {
    console.error('Clean failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. queue.drain() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function drainNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-drain-redis-error — drain() throws on Redis errors. No try-catch.
  await queue.drain();
  await queue.close();
}

export async function drainWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: drain() inside try-catch
    await queue.drain();
  } catch (err) {
    console.error('Drain failed:', err);
  } finally {
    await queue.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. queue.retryJobs() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function retryJobsNoCatch() {
  const queue = new Queue('jobs');
  // SHOULD_FIRE: queue-retryjobs-redis-error — retryJobs() throws on Redis errors. No try-catch.
  await queue.retryJobs({ state: 'failed' });
  await queue.close();
}

export async function retryJobsWithCatch() {
  const queue = new Queue('jobs');
  try {
    // SHOULD_NOT_FIRE: retryJobs() inside try-catch
    await queue.retryJobs({ state: 'failed' });
  } catch (err) {
    console.error('Retry jobs failed:', err);
  } finally {
    await queue.close();
  }
}
