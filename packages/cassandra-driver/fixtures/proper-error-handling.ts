/**
 * cassandra-driver Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling.
 * Should NOT trigger violations.
 */

import { Client } from 'cassandra-driver';

/**
 * ✅ Proper error handling for connect
 */
async function connectWithErrorHandling() {
  const client = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra cluster');
    return client;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for execute
 */
async function executeWithErrorHandling(client: Client) {
  try {
    const result = await client.execute('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for parameterized query
 */
async function parameterizedQueryWithErrorHandling(client: Client, userId: string) {
  try {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await client.execute(query, [userId], { prepare: true });
    return result.rows[0];
  } catch (error) {
    console.error('Parameterized query failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for INSERT
 */
async function insertWithErrorHandling(client: Client, id: string, name: string) {
  try {
    const query = 'INSERT INTO users (id, name) VALUES (?, ?)';
    await client.execute(query, [id, name], { prepare: true });
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for batch operations
 */
async function batchWithErrorHandling(client: Client) {
  const queries = [
    { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'Alice'] },
    { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['2', 'Bob'] }
  ];

  try {
    await client.batch(queries, { prepare: true });
  } catch (error) {
    console.error('Batch operation failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for shutdown
 */
async function shutdownWithErrorHandling(client: Client) {
  try {
    await client.shutdown();
    console.log('Client shut down successfully');
  } catch (error) {
    console.error('Shutdown error:', error);
    // Usually safe to ignore, but log for investigation
  }
}

/**
 * ✅ Proper error handling for UPDATE
 */
async function updateWithErrorHandling(client: Client, userId: string, name: string) {
  try {
    const query = 'UPDATE users SET name = ? WHERE id = ?';
    await client.execute(query, [name, userId], { prepare: true });
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for DELETE
 */
async function deleteWithErrorHandling(client: Client, userId: string) {
  try {
    const query = 'DELETE FROM users WHERE id = ?';
    await client.execute(query, [userId], { prepare: true });
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for stream - MUST listen for 'error' event
 */
function streamWithErrorHandling(client: Client) {
  const stream = client.stream('SELECT * FROM users');

  stream.on('readable', function() {
    let row;
    while (row = this.read()) {
      console.log('Row:', row);
    }
  });

  stream.on('end', function() {
    console.log('Stream ended');
  });

  // CRITICAL: Must handle error event
  stream.on('error', function(err) {
    console.error('Stream error:', err);
  });

  return stream;
}

/**
 * ✅ Proper error handling for eachRow - MUST check error in endCallback
 */
function eachRowWithErrorHandling(client: Client) {
  client.eachRow(
    'SELECT * FROM users',
    [],
    { prepare: true },
    function rowCallback(n, row) {
      console.log('Row', n, ':', row);
    },
    function endCallback(err, result) {
      // CRITICAL: Must check error parameter
      if (err) {
        console.error('eachRow error:', err);
        return;
      }
      console.log('eachRow completed, total rows:', result.rowLength);
    }
  );
}
