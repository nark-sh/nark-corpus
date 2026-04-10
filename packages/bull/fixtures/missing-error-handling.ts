import Queue from 'bull';

/**
 * Missing event handlers for Queue
 * Should trigger 3 ERROR violations (failed, stalled, error listeners missing)
 */
function setupQueue() {
  const myQueue = new Queue('myQueue', 'redis://localhost:6379');

  // ❌ Missing: myQueue.on('failed', ...)
  // ❌ Missing: myQueue.on('stalled', ...)
  // ❌ Missing: myQueue.on('error', ...)

  // Missing error handling in job processor
  myQueue.process(async (job) => {
    // No try-catch - errors will cause job to fail
    const result = await someAsyncOperation(job.data);
    return result;
  });
}

async function someAsyncOperation(data: any): Promise<any> {
  throw new Error('Operation failed');
}
