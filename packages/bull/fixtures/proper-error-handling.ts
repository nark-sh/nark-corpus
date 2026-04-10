import Queue from 'bull';

/**
 * Proper error handling for Queue
 * Should NOT trigger violations (all required listeners attached)
 */
function setupQueue() {
  const myQueue = new Queue('myQueue', 'redis://localhost:6379');

  // ✅ Proper event listeners attached
  myQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });

  myQueue.on('stalled', (job) => {
    console.error(`Job ${job.id} stalled`);
  });

  myQueue.on('error', (error) => {
    console.error('Queue error:', error);
  });

  // Proper error handling in job processor
  myQueue.process(async (job) => {
    try {
      const result = await someAsyncOperation(job.data);
      return result;
    } catch (error) {
      console.error('Job processing failed:', error);
      throw error; // Re-throw to mark job as failed
    }
  });
}

async function someAsyncOperation(data: any): Promise<any> {
  throw new Error('Operation failed');
}
