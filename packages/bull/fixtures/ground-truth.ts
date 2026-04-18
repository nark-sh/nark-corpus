import Queue from 'bull';
import { Job } from 'bull';

// ============================================================
// VIOLATION CASES — should be flagged by scanner
// ============================================================

// @expect-violation: add-redis-connection-error
// @expect-violation: addbulk-redis-connection-error
async function addJobWithoutErrorHandling() {
  const queue = new Queue('email-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled', job.id));
  queue.on('error', (err) => console.error(err));

  // ❌ No try-catch — Redis connection errors propagate as unhandled rejections
  const job = await queue.add({ email: 'user@example.com', subject: 'Welcome' });
  return job.id;
}

// @expect-violation: addbulk-redis-connection-error
async function addBulkWithoutErrorHandling() {
  const queue = new Queue('bulk-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled', job.id));
  queue.on('error', (err) => console.error(err));

  // ❌ No try-catch — if Redis drops, entire batch of jobs is lost silently
  const jobs = await queue.addBulk([
    { data: { userId: 1, event: 'signup' } },
    { data: { userId: 2, event: 'signup' } },
    { data: { userId: 3, event: 'signup' } },
  ]);
  return jobs.map(j => j.id);
}

// @expect-violation: close-not-called-on-shutdown
function setupQueueWithNoShutdown() {
  // ❌ Queue created but close() never called — Redis connections leak on process exit
  const queue = new Queue('worker-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled', job.id));
  queue.on('error', (err) => console.error(err));

  queue.process(async (job) => {
    try {
      return await processWork(job.data);
    } catch (err) {
      throw err;
    }
  });

  // ❌ No process.on('SIGTERM', ...) calling queue.close()
  return queue;
}

// @expect-violation: obliterate-active-jobs-error
// @expect-violation: obliterate-irreversible
async function obliterateQueueWithoutGuard() {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });

  // ❌ No try-catch — throws if active jobs exist
  // ❌ No environment guard — dangerous if called in production
  await queue.obliterate();
}

// @expect-violation: clean-missing-grace-period
// @expect-violation: clean-invalid-type
async function cleanQueueIncorrectly() {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });
  queue.on('error', (err) => console.error(err));

  // ❌ No try-catch — throws "You must define a grace period." if grace is undefined
  // (would throw: grace must be provided)
  const removed = await queue.clean(undefined as any, 'completed');

  // ❌ No try-catch — 'waiting' is invalid, correct value is 'wait'
  await queue.clean(3600000, 'waiting' as any);
}

// @expect-violation: retry-job-not-exist
// @expect-violation: retry-job-not-failed
async function retryJobWithoutErrorHandling(jobId: string) {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });
  const job = await queue.getJob(jobId);

  if (job) {
    // ❌ No try-catch — throws "Couldn't retry job: The job doesn't exist"
    // if job was removed between getJob() and retry()
    await job.retry();
  }
}

// @expect-violation: finished-job-failed
// @expect-violation: finished-queue-closing
async function waitForJobWithoutErrorHandling() {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  const job = await queue.add({ work: 'heavy-computation' });

  // ❌ No try-catch — rejects with job.failedReason if job fails
  // ❌ No try-catch — rejects if queue.close() is called while waiting
  const result = await job.finished();
  return result;
}

// ============================================================
// CLEAN CASES — should NOT be flagged by scanner
// ============================================================

// @expect-clean
async function addJobWithErrorHandling() {
  const queue = new Queue('email-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error('Job failed:', err));
  queue.on('stalled', (job) => console.error('Job stalled:', job.id));
  queue.on('error', (err) => console.error('Queue error:', err));

  try {
    const job = await queue.add({ email: 'user@example.com', subject: 'Welcome' });
    return job.id;
  } catch (err) {
    console.error('Failed to add job:', err);
    throw err;
  }
}

// @expect-clean
async function addBulkWithErrorHandling() {
  const queue = new Queue('bulk-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled', job.id));
  queue.on('error', (err) => console.error(err));

  try {
    const jobs = await queue.addBulk([
      { data: { userId: 1 } },
      { data: { userId: 2 } },
    ]);
    return jobs.map(j => j.id);
  } catch (err) {
    console.error('Failed to add bulk jobs:', err);
    throw err;
  }
}

// @expect-clean
async function setupQueueWithGracefulShutdown() {
  const queue = new Queue('worker-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error('Job failed:', err));
  queue.on('stalled', (job) => console.error('Job stalled:', job.id));
  queue.on('error', (err) => console.error('Queue error:', err));

  queue.process(async (job) => {
    try {
      return await processWork(job.data);
    } catch (err) {
      throw err;
    }
  });

  // ✅ Proper shutdown handler
  process.on('SIGTERM', async () => {
    await queue.close();
    process.exit(0);
  });

  return queue;
}

// @expect-clean
async function obliterateWithGuards() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot obliterate in production');
  }

  const queue = new Queue('test-queue', { redis: { host: 'localhost', port: 6379 } });

  try {
    await queue.obliterate({ force: true });
  } catch (err) {
    console.error('Failed to obliterate queue:', err);
    throw err;
  } finally {
    await queue.close();
  }
}

// @expect-clean
async function cleanQueueCorrectly() {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });
  queue.on('error', (err) => console.error(err));

  try {
    // ✅ Correct: provides grace period, uses valid type string 'wait' (not 'waiting')
    const completedRemoved = await queue.clean(7 * 24 * 3600 * 1000, 'completed');
    const failedRemoved = await queue.clean(24 * 3600 * 1000, 'failed');
    console.log(`Cleaned ${completedRemoved.length} completed, ${failedRemoved.length} failed`);
  } catch (err) {
    console.error('Queue clean failed:', err);
    throw err;
  }
}

// @expect-clean
async function retryJobWithErrorHandling(jobId: string) {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });
  const job = await queue.getJob(jobId);

  if (job) {
    try {
      await job.retry();
    } catch (err: any) {
      if (err.message.includes("doesn't exist")) {
        console.warn('Job no longer exists — may have expired');
      } else if (err.message.includes('not failed')) {
        console.warn('Job is not in failed state — already recovered');
      } else {
        throw err;
      }
    }
  }
}

// @expect-clean
async function waitForJobWithErrorHandling() {
  const queue = new Queue('jobs', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  const job = await queue.add({ work: 'heavy-computation' });

  try {
    const result = await job.finished();
    return result;
  } catch (err: any) {
    console.error('Job failed:', err.message);
    throw err;
  }
}

// ============================================================
// Queue.whenCurrentJobsFinished — VIOLATION CASES
// ============================================================

// @expect-violation: when-current-jobs-not-awaited-before-close
async function shutdownWithoutWaitingForJobs() {
  const queue = new Queue('worker-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  // ❌ Calling close() without first awaiting whenCurrentJobsFinished()
  // Active jobs are cut off mid-execution → stall on next startup → duplicate processing
  await queue.close();
}

// @expect-clean
async function gracefulShutdownWithWaitForJobs() {
  const queue = new Queue('worker-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  // ✅ Wait for active jobs to finish before closing
  await queue.whenCurrentJobsFinished();
  await queue.close();
}

// ============================================================
// Queue.removeJobs — VIOLATION CASES
// ============================================================

// @expect-violation: remove-jobs-no-try-catch
async function removeJobsWithoutErrorHandling() {
  const queue = new Queue('cleanup-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  // ❌ No try-catch — Redis connection errors propagate as unhandled rejections
  await queue.removeJobs('email-*');
}

// @expect-clean
async function removeJobsWithErrorHandling() {
  const queue = new Queue('cleanup-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  try {
    // ✅ Wrapped in try-catch — zero matches silently succeeds, Redis errors are caught
    await queue.removeJobs('email-*');
  } catch (err) {
    console.error('Failed to remove jobs:', err);
    throw err;
  }
}

// ============================================================
// Job.releaseLock — VIOLATION CASES
// ============================================================

// @expect-violation: release-lock-no-try-catch
async function releaseLockWithoutErrorHandling(job: Job) {
  // ❌ No try-catch — throws Error('Could not release lock for job <id>') if not owner
  await job.releaseLock();
}

// @expect-clean
async function releaseLockWithErrorHandling(job: Job) {
  try {
    // ✅ Wrapped in try-catch — handles lock ownership errors gracefully
    await job.releaseLock();
  } catch (err: any) {
    console.error('Could not release lock:', err.message);
    // Lock expired via TTL — no retry needed
  }
}

// ============================================================
// Job.moveToFailed — VIOLATION CASES
// ============================================================

// @expect-violation: move-to-failed-no-try-catch
async function moveToFailedWithoutErrorHandling(job: Job) {
  // ❌ No try-catch — throws when job missing (-1), wrong state (-3), lock mismatch (-6)
  await job.moveToFailed({ message: 'Processing error' });
}

// @expect-clean
async function moveToFailedWithErrorHandling(job: Job) {
  try {
    // ✅ Wrapped in try-catch — handles all finishedErrors codes
    await job.moveToFailed({ message: 'Processing error' });
  } catch (err: any) {
    if (err.message.includes('Missing key')) {
      // Job was already cleaned up — safe to ignore
      console.log('Job already removed:', job.id);
    } else if (err.message.includes('is not in the active state')) {
      // Job completed via another path — safe to ignore
      console.log('Job already completed:', job.id);
    } else {
      throw err;
    }
  }
}

// Stub for compilation
async function processWork(data: any) { return data; }

// ============================================================
// Job.extendLock — VIOLATION CASES (deepen-stream-1 pass 3)
// ============================================================

// @expect-violation: extend-lock-zero-return-unchecked
// @expect-violation: extend-lock-no-try-catch
async function extendLockWithoutAnyHandling(job: Job) {
  // ❌ No try-catch and no return value check
  // If Redis is down: unhandled rejection crashes the function
  // If lock was taken by another worker (returns 0): processing continues as duplicate
  await job.extendLock(30000);
  // ... continues processing job (potential duplicate\!)
}

// @expect-violation: extend-lock-zero-return-unchecked
async function extendLockWithTryCatchButNoReturnCheck(job: Job) {
  try {
    // ❌ Has try-catch but doesn't check return value
    // If extendLock returns 0 (lock taken), processing continues as duplicate
    await job.extendLock(30000);
    // ... continues processing job (potential duplicate if lock was taken\!)
  } catch (err) {
    console.error('Lock renewal error:', err);
  }
}

// @expect-clean
async function extendLockWithFullHandling(job: Job) {
  try {
    // ✅ Check return value AND wrap in try-catch
    const extended = await job.extendLock(30000);
    if (\!extended) {
      // Another worker took the job — stop processing immediately
      throw new Error('Lock lost: job taken by another worker');
    }
    // Safe to continue processing — lock still held
  } catch (err: any) {
    console.error('Lock renewal failed — aborting job:', err.message);
    throw err; // Re-throw to abort job processing
  }
}

// ============================================================
// Queue.getMetrics — VIOLATION CASES (deepen-stream-1 pass 3)
// ============================================================

// @expect-violation: get-metrics-no-try-catch
async function getMetricsWithoutErrorHandling() {
  const queue = new Queue('metrics-queue', { redis: { host: 'localhost', port: 6379 } });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  // ❌ No try-catch — Redis pipeline errors crash the metrics endpoint
  const metrics = await queue.getMetrics('completed');
  console.log('Metrics:', metrics.data);
}

// @expect-clean
async function getMetricsWithErrorHandling() {
  const queue = new Queue('metrics-queue', {
    redis: { host: 'localhost', port: 6379 },
    metrics: { maxDataPoints: 1440 }, // ✅ Metrics enabled
  });
  queue.on('failed', (job, err) => console.error(err));
  queue.on('stalled', (job) => console.error('stalled'));
  queue.on('error', (err) => console.error(err));

  try {
    // ✅ try-catch handles Redis pipeline errors
    const metrics = await queue.getMetrics('completed');
    if (metrics.count === 0) {
      console.warn('No metrics data yet — ensure metrics is enabled in QueueOptions');
    }
    return metrics.data;
  } catch (err) {
    console.error('Failed to fetch queue metrics:', err);
    return [];
  }
}
