/**
 * cassandra-driver Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "cassandra-driver"):
 *   Client class:
 *   - client.connect()          postcondition: connection-failure, authentication-failure
 *   - client.execute()          postcondition: syntax-error, unavailable, timeout, write-timeout, read-timeout, overloaded, invalid-query
 *   - client.batch()            postcondition: batch-failure, write-timeout
 *   - client.shutdown()         postcondition: shutdown-error
 *   - client.stream()           postcondition: stream-error
 *   - client.eachRow()          postcondition: row-callback-error
 *
 *   mapping.ModelMapper:
 *   - mapper.insert()           postcondition: mapper-insert-no-try-catch, mapper-insert-if-not-exists-not-checked
 *   - mapper.update()           postcondition: mapper-update-no-try-catch, mapper-update-if-exists-not-checked
 *   - mapper.remove()           postcondition: mapper-remove-no-try-catch
 *   - mapper.get()              postcondition: mapper-get-null-not-checked, mapper-get-no-try-catch
 *   - mapper.find()             postcondition: mapper-find-result-not-iterated, mapper-find-no-try-catch
 *
 *   concurrent:
 *   - executeConcurrent()       postcondition: execute-concurrent-no-try-catch, execute-concurrent-errors-not-checked
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires await client.execute/batch/connect/shutdown without try-catch
 *   - ThrowingFunctionDetector fires await mapper.insert/update/remove/get/find without try-catch
 *   - ThrowingFunctionDetector fires await executeConcurrent() without try-catch
 *   - StreamErrorDetector fires client.stream() without .on('error') listener
 *   - EachRowDetector fires eachRow() endCallback without err check
 */

import { Client, mapping, concurrent } from 'cassandra-driver';

const { Mapper } = mapping;

const client = new Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Client.connect() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function connectNoCatch() {
  // SHOULD_FIRE: connection-failure — client.connect() without try-catch throws NoHostAvailableError on cluster unreachable
  await client.connect();
}

export async function connectWithCatch() {
  try {
    // SHOULD_NOT_FIRE: client.connect() inside try-catch satisfies error handling
    await client.connect();
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Client.execute() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function executeNoCatch() {
  // SHOULD_FIRE: syntax-error — client.execute() without try-catch throws ResponseError on invalid query
  const result = await client.execute('SELECT * FROM users');
  return result.rows;
}

export async function executeWithCatch() {
  try {
    // SHOULD_NOT_FIRE: client.execute() inside try-catch satisfies error handling
    const result = await client.execute('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Client.batch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function batchNoCatch() {
  const queries = [
    { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'Alice'] },
  ];
  // SHOULD_FIRE: batch-failure — client.batch() without try-catch throws ResponseError on failure
  await client.batch(queries, { prepare: true });
}

export async function batchWithCatch() {
  const queries = [
    { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'Alice'] },
  ];
  try {
    // SHOULD_NOT_FIRE: client.batch() inside try-catch satisfies error handling
    await client.batch(queries, { prepare: true });
  } catch (error) {
    console.error('Batch failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Client.stream() — without error listener
// ─────────────────────────────────────────────────────────────────────────────

export function streamNoErrorListener() {
  // SHOULD_FIRE: stream-error — client.stream() without .on('error') listener crashes on query error
  const stream = client.stream('SELECT * FROM users');
  stream.on('readable', function() {
    let row;
    while ((row = (this as any).read())) {
      console.log('Row:', row);
    }
  });
  return stream;
}

export function streamWithErrorListener() {
  const stream = client.stream('SELECT * FROM users');
  stream.on('readable', function() {
    let row;
    while ((row = (this as any).read())) {
      console.log('Row:', row);
    }
  });
  // SHOULD_NOT_FIRE: .on('error') listener present satisfies stream error handling
  stream.on('error', (err) => {
    console.error('Stream error:', err);
  });
  return stream;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. mapping.ModelMapper.insert() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

const mapper = new Mapper(client, {
  models: { User: { tables: ['users'] } },
});
const userMapper = mapper.forModel('User');

export async function mapperInsertNoCatch(id: string, name: string) {
  // SHOULD_FIRE: mapper-insert-no-try-catch — ModelMapper.insert() without try-catch throws NoHostAvailableError/ResponseError
  await userMapper.insert({ id, name });
}

export async function mapperInsertWithCatch(id: string, name: string) {
  try {
    // SHOULD_NOT_FIRE: ModelMapper.insert() inside try-catch satisfies error handling
    await userMapper.insert({ id, name });
  } catch (error) {
    console.error('Mapper insert failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. mapping.ModelMapper.update() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mapperUpdateNoCatch(id: string, name: string) {
  // SHOULD_FIRE: mapper-update-no-try-catch — ModelMapper.update() without try-catch throws NoHostAvailableError/ResponseError
  await userMapper.update({ id, name });
}

export async function mapperUpdateWithCatch(id: string, name: string) {
  try {
    // SHOULD_NOT_FIRE: ModelMapper.update() inside try-catch satisfies error handling
    await userMapper.update({ id, name });
  } catch (error) {
    console.error('Mapper update failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. mapping.ModelMapper.remove() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mapperRemoveNoCatch(id: string) {
  // SHOULD_FIRE: mapper-remove-no-try-catch — ModelMapper.remove() without try-catch throws NoHostAvailableError/ResponseError
  await userMapper.remove({ id });
}

export async function mapperRemoveWithCatch(id: string) {
  try {
    // SHOULD_NOT_FIRE: ModelMapper.remove() inside try-catch satisfies error handling
    await userMapper.remove({ id });
  } catch (error) {
    console.error('Mapper remove failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. mapping.ModelMapper.get() — null not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function mapperGetNullNotChecked(id: string) {
  try {
    // SHOULD_FIRE: mapper-get-null-not-checked — ModelMapper.get() returns null when row missing; accessing properties without null check throws TypeError
    const user = await userMapper.get({ id });
    return (user as any).name; // accessing without null check
  } catch (error) {
    throw error;
  }
}

export async function mapperGetWithNullCheck(id: string) {
  try {
    // SHOULD_NOT_FIRE: null check present before accessing properties
    const user = await userMapper.get({ id });
    if (!user) return null;
    return (user as any).name;
  } catch (error) {
    throw error;
  }
}

export async function mapperGetNoCatch(id: string) {
  // SHOULD_FIRE: mapper-get-no-try-catch — ModelMapper.get() without try-catch throws NoHostAvailableError/OperationTimedOutError
  const user = await userMapper.get({ id });
  if (!user) return null;
  return (user as any).name;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. mapping.ModelMapper.find() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mapperFindNoCatch(name: string) {
  // SHOULD_FIRE: mapper-find-no-try-catch — ModelMapper.find() without try-catch throws NoHostAvailableError/ResponseError
  const result = await userMapper.find({ name });
  return result.toArray();
}

export async function mapperFindWithCatch(name: string) {
  try {
    // SHOULD_NOT_FIRE: ModelMapper.find() inside try-catch satisfies error handling
    const result = await userMapper.find({ name });
    return result.toArray();
  } catch (error) {
    console.error('Mapper find failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. concurrent.executeConcurrent() — without try-catch (raiseOnFirstError=true default)
// ─────────────────────────────────────────────────────────────────────────────

export async function executeConcurrentNoCatch(params: any[][]) {
  // SHOULD_FIRE: execute-concurrent-no-try-catch — executeConcurrent() without try-catch rejects on first failure
  const result = await concurrent.executeConcurrent(
    client,
    'INSERT INTO users (id, name) VALUES (?, ?)',
    params
  );
  return result;
}

export async function executeConcurrentWithCatch(params: any[][]) {
  try {
    // SHOULD_NOT_FIRE: executeConcurrent() inside try-catch satisfies error handling
    const result = await concurrent.executeConcurrent(
      client,
      'INSERT INTO users (id, name) VALUES (?, ?)',
      params
    );
    return result;
  } catch (error) {
    console.error('Concurrent execution failed:', error);
    throw error;
  }
}

export async function executeConcurrentErrorsNotChecked(params: any[][]) {
  try {
    // SHOULD_FIRE: execute-concurrent-errors-not-checked — raiseOnFirstError=false accumulates errors silently; caller MUST check result.errors
    const result = await concurrent.executeConcurrent(
      client,
      'INSERT INTO users (id, name) VALUES (?, ?)',
      params,
      { raiseOnFirstError: false }
    );
    // No check of result.errors — silent failure
    return result.totalExecuted;
  } catch (error) {
    throw error;
  }
}

export async function executeConcurrentErrorsChecked(params: any[][]) {
  try {
    // SHOULD_NOT_FIRE: errors array is checked after resolution
    const result = await concurrent.executeConcurrent(
      client,
      'INSERT INTO users (id, name) VALUES (?, ?)',
      params,
      { raiseOnFirstError: false }
    );
    if (result.errors.length > 0) {
      console.error(`${result.errors.length} queries failed:`, result.errors);
      throw new Error(`Batch had ${result.errors.length} failures`);
    }
    return result.totalExecuted;
  } catch (error) {
    throw error;
  }
}
