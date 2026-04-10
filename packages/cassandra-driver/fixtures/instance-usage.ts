/**
 * cassandra-driver Fixtures - Instance Usage
 *
 * Tests detection of cassandra-driver usage via Client instances.
 */

import { Client } from 'cassandra-driver';

/**
 * ❌ Client instance without error handling
 * Should trigger ERROR violations
 */
async function useClientInstanceWithoutErrorHandling() {
  const client = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1'
  });

  // ❌ Multiple operations without try-catch
  await client.connect();
  await client.execute('SELECT * FROM users');
  await client.execute('INSERT INTO users (id, name) VALUES (?, ?)', ['1', 'Alice']);
  await client.shutdown();
}

/**
 * ❌ Multiple client instances without error handling
 * Should trigger ERROR violations
 */
async function multipleClientsWithoutErrorHandling() {
  const client1 = new Client({ contactPoints: ['host1'], localDataCenter: 'dc1' });
  const client2 = new Client({ contactPoints: ['host2'], localDataCenter: 'dc2' });

  // ❌ No try-catch for either client
  await client1.connect();
  await client2.connect();

  await client1.execute('SELECT * FROM users');
  await client2.execute('SELECT * FROM products');

  await client1.shutdown();
  await client2.shutdown();
}

/**
 * ❌ Client with batch operations without error handling
 * Should trigger ERROR violation
 */
async function batchOperationsWithoutErrorHandling() {
  const client = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1'
  });

  await client.connect();

  const queries = [
    { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'Alice'] },
    { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['2', 'Bob'] }
  ];

  // ❌ No try-catch
  await client.batch(queries, { prepare: true });

  await client.shutdown();
}

/**
 * ✅ Proper error handling for client instances
 */
async function useClientInstanceWithErrorHandling() {
  const client = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1'
  });

  try {
    await client.connect();
    await client.execute('SELECT * FROM users');
    await client.execute('INSERT INTO users (id, name) VALUES (?, ?)', ['1', 'Alice']);
  } catch (error) {
    console.error('Cassandra operation failed:', error);
    throw error;
  } finally {
    try {
      await client.shutdown();
    } catch (error) {
      console.error('Shutdown error:', error);
    }
  }
}
