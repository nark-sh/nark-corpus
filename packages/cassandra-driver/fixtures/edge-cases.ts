/**
 * cassandra-driver Fixtures - Edge Cases
 *
 * Tests edge cases like consistency errors, timeouts, NoHostAvailable patterns.
 */

import { Client, errors } from 'cassandra-driver';

const client = new Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1'
});

/**
 * ✅ Handling NoHostAvailableError specifically
 */
async function handleNoHostAvailable() {
  try {
    await client.connect();
  } catch (err) {
    if (err instanceof errors.NoHostAvailableError) {
      console.error('All contact points failed:', err.innerErrors);
      // Implement retry logic or fallback
    }
    throw err;
  }
}

/**
 * ✅ Handling timeout errors with retry
 */
async function handleTimeoutWithRetry() {
  let retries = 3;
  while (retries > 0) {
    try {
      const result = await client.execute('SELECT * FROM large_table');
      return result;
    } catch (err) {
      if (err instanceof errors.OperationTimedOutError) {
        console.log('Timeout, retrying...');
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw err;
      }
    }
  }
}

/**
 * ✅ Handling ResponseError with code checking
 */
async function handleResponseErrorCodes() {
  try {
    const result = await client.execute('SELECT * FROM users WHERE id = ?', [123]);
    return result;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      switch (err.code) {
        case 0x1000: // Unavailable
          console.error('Insufficient replicas available');
          break;
        case 0x1100: // Write timeout
          console.error('Write timeout - data may be partially written');
          break;
        case 0x1200: // Read timeout
          console.error('Read timeout - transient error');
          break;
        case 0x2000: // Syntax error
          console.error('CQL syntax error - fix query');
          break;
        case 0x2200: // Invalid query
          console.error('Table or keyspace not found');
          break;
        default:
          console.error('Other response error:', err.code);
      }
    }
    throw err;
  }
}

/**
 * ✅ Handling BusyConnectionError
 */
async function handleBusyConnection() {
  try {
    const result = await client.execute('SELECT * FROM users');
    return result;
  } catch (err) {
    if (err instanceof errors.BusyConnectionError) {
      console.error('Connection pool exhausted - configure pooling');
      // Wait and retry or implement backpressure
    }
    throw err;
  }
}

/**
 * ✅ Handling authentication errors
 */
async function handleAuthenticationError() {
  const authClient = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1',
    credentials: { username: 'user', password: 'pass' }
  });

  try {
    await authClient.connect();
  } catch (err) {
    if (err instanceof errors.AuthenticationError) {
      console.error('Authentication failed - check credentials');
      // Do NOT retry with same credentials
    }
    throw err;
  }
}

/**
 * ✅ Complex retry logic for transient errors
 */
async function retryTransientErrors() {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await client.execute('SELECT * FROM users');
      return result;
    } catch (err) {
      if (err instanceof errors.ResponseError) {
        // Transient errors that can be retried
        const transientCodes = [0x1000, 0x1100, 0x1200]; // Unavailable, Write timeout, Read timeout
        if (transientCodes.includes(err.code)) {
          console.log(`Transient error, retry ${attempt + 1}/${maxRetries}`);
          attempt++;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
      }
      throw err;
    }
  }
}

/**
 * ❌ Stream without error listener (edge case - should fail)
 */
function streamMissingErrorHandler() {
  const stream = client.stream('SELECT * FROM users');

  stream.on('readable', function() {
    let row;
    while (row = this.read()) {
      console.log('Row:', row);
    }
  });

  // MISSING: No error listener!
  return stream;
}

/**
 * ✅ Proper stream error handling with timeout
 */
function streamWithTimeout() {
  const stream = client.stream('SELECT * FROM users', [], { readTimeout: 5000 });

  stream.on('readable', function() {
    let row;
    while (row = this.read()) {
      console.log('Row:', row);
    }
  });

  stream.on('error', function(err) {
    if (err instanceof errors.OperationTimedOutError) {
      console.error('Stream timeout after 5000ms');
    } else {
      console.error('Stream error:', err);
    }
  });

  stream.on('end', function() {
    console.log('Stream completed');
  });

  return stream;
}

/**
 * ❌ eachRow without error handling (edge case - should fail)
 */
function eachRowMissingErrorCheck() {
  client.eachRow(
    'SELECT * FROM users',
    [],
    function rowCallback(n, row) {
      console.log('Row', n, ':', row);
    },
    function endCallback(err, result) {
      // MISSING: No error check!
      console.log('Total:', result.rowLength);
    }
  );
}

/**
 * ✅ Proper eachRow with error handling
 */
function eachRowWithProperHandling() {
  client.eachRow(
    'SELECT * FROM users',
    [],
    { prepare: true },
    function rowCallback(n, row) {
      console.log('Row', n, ':', row);
    },
    function endCallback(err, result) {
      if (err) {
        if (err instanceof errors.NoHostAvailableError) {
          console.error('Connection failure in eachRow');
        } else if (err instanceof errors.OperationTimedOutError) {
          console.error('Timeout in eachRow');
        } else {
          console.error('Error in eachRow:', err);
        }
        return;
      }
      console.log('Success, total:', result.rowLength);
    }
  );
}

export {
  handleNoHostAvailable,
  handleTimeoutWithRetry,
  handleResponseErrorCodes,
  handleBusyConnection,
  handleAuthenticationError,
  retryTransientErrors,
  streamMissingErrorHandler,
  streamWithTimeout,
  eachRowMissingErrorCheck,
  eachRowWithProperHandling
};
