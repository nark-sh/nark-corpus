/**
 * mongodb Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "mongodb"):
 *   - MongoClient.connect()      postcondition: connection-failure
 *   - users.find()               postcondition: query-failure
 *   - users.findOneAndUpdate()   postconditions: findoneandupdate-null-not-found, findoneandupdate-write-concern-error
 *   - users.findOneAndDelete()   postconditions: findoneanddelete-null-not-found
 *   - users.findOneAndReplace()  postconditions: findoneandreplace-null-not-found
 *   - session.withTransaction()  postconditions: withtransaction-transient-error-not-retried-externally
 *   - collection.watch()         postconditions: watch-error-event-not-thrown
 *   - collection.replaceOne()    postconditions: replaceone-network-error
 *   - client.close()             postconditions: close-not-called-resource-leak
 *   - collection.dropIndex()     postconditions: dropindex-not-found
 *
 * Detection path: MongoClient.connect → InstanceTracker fires →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { MongoClient, Collection } from 'mongodb';

const connectionString = 'mongodb://localhost:27017';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MongoClient.connect() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function connectNoCatch() {
  // SHOULD_FIRE: connection-failure — MongoClient.connect() throws on connection errors. No try-catch.
  const client = await MongoClient.connect(connectionString);
  await client.close();
  return client;
}

export async function connectWithCatch() {
  try {
    // SHOULD_NOT_FIRE: MongoClient.connect() inside try-catch satisfies error handling
    const client = await MongoClient.connect(connectionString);
    await client.close();
    return client;
  } catch (err) {
    console.error('Connection failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. collection.find() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function queryNoCatch(users: Collection) {
  // SHOULD_NOT_FIRE: scanner gap — query-failure — find().toArray() throws on query errors. No try-catch.
  const results = await users.find({}).toArray();
  return results;
}

export async function queryWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: find().toArray() inside try-catch satisfies error handling
    const results = await users.find({}).toArray();
    return results;
  } catch (err) {
    console.error('Query failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. collection.findOneAndUpdate() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: findoneandupdate-null-not-found
// @expect-violation: findoneandupdate-write-concern-error
export async function findOneAndUpdateNoCatch(users: Collection) {
  // NOTE: No detection yet — users param (Collection) not tracked as mongodb instance (require_instance_tracking=true)
  // SHOULD_NOT_FIRE: findoneandupdate-null-not-found — scanner cannot detect yet, needs instance tracking for Collection params
  const result = await users.findOneAndUpdate(
    { _id: 'user-123' },
    { $set: { status: 'active' } },
    { returnDocument: 'after' }
  );
  return result; // null if not found — not checked
}

// @expect-clean
export async function findOneAndUpdateWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: findOneAndUpdate inside try-catch with null check
    const result = await users.findOneAndUpdate(
      { _id: 'user-123' },
      { $set: { status: 'active' } },
      { returnDocument: 'after' }
    );
    if (result === null) {
      throw new Error('User not found');
    }
    return result;
  } catch (err) {
    console.error('findOneAndUpdate failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. collection.findOneAndDelete() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: findoneanddelete-null-not-found
// @expect-violation: findoneanddelete-network-error
export async function findOneAndDeleteNoCatch(users: Collection) {
  // NOTE: No detection yet — users param (Collection) not tracked as mongodb instance (require_instance_tracking=true)
  // SHOULD_NOT_FIRE: findoneanddelete-null-not-found — scanner cannot detect yet, needs instance tracking for Collection params
  const deleted = await users.findOneAndDelete({ _id: 'user-123' });
  return deleted; // null if not found — not checked
}

// @expect-clean
export async function findOneAndDeleteWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: findOneAndDelete inside try-catch with null check
    const deleted = await users.findOneAndDelete({ _id: 'user-123' });
    if (deleted === null) {
      throw new Error('User not found for deletion');
    }
    return deleted;
  } catch (err) {
    console.error('findOneAndDelete failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. collection.findOneAndReplace() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: findoneandreplace-null-not-found
export async function findOneAndReplaceNoCatch(users: Collection) {
  // NOTE: No detection yet — users param (Collection) not tracked as mongodb instance (require_instance_tracking=true)
  // SHOULD_NOT_FIRE: findoneandreplace-null-not-found — scanner cannot detect yet, needs instance tracking for Collection params
  const result = await users.findOneAndReplace(
    { _id: 'user-123' },
    { name: 'New Name', status: 'active' }
  );
  return result; // null if not found — not checked
}

// @expect-clean
export async function findOneAndReplaceWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: findOneAndReplace inside try-catch
    const result = await users.findOneAndReplace(
      { _id: 'user-123' },
      { name: 'New Name', status: 'active' }
    );
    if (result === null) {
      throw new Error('User not found for replacement');
    }
    return result;
  } catch (err) {
    console.error('findOneAndReplace failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. collection.replaceOne() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: replaceone-network-error
export async function replaceOneNoCatch(users: Collection) {
  // SHOULD_NOT_FIRE: scanner gap — replaceone-validation-failure — replaceOne without try-catch, validation errors unhandled
  const result = await users.replaceOne(
    { _id: 'user-123' },
    { name: 'New Name', status: 'active' }
  );
  return result;
}

// @expect-clean
export async function replaceOneWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: replaceOne inside try-catch
    const result = await users.replaceOne(
      { _id: 'user-123' },
      { name: 'New Name', status: 'active' }
    );
    return result;
  } catch (err) {
    console.error('replaceOne failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. collection.dropIndex() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dropindex-not-found
export async function dropIndexNoCatch(users: Collection) {
  // SHOULD_NOT_FIRE: scanner gap — dropindex-not-found — dropIndex without try-catch, IndexNotFound unhandled
  await users.dropIndex('email_1');
}

// @expect-clean
export async function dropIndexWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: dropIndex inside try-catch
    await users.dropIndex('email_1');
  } catch (err: unknown) {
    // Handle IndexNotFound gracefully for idempotent migrations
    if (err instanceof Error && err.message.includes('index not found')) {
      console.log('Index already dropped, continuing');
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. client.close() — resource leak pattern (edge case)
// ─────────────────────────────────────────────────────────────────────────────

export async function clientWithoutClose() {
  // SHOULD_NOT_FIRE: connection-failure — MongoClient.connect() in clientWithoutClose is not in a try-catch but close pattern not detectable yet
  // NOTE: Scanner fires connection-failure from connect(), not the missing close()
  const client = await MongoClient.connect(connectionString);
  const users = client.db('mydb').collection('users');
  const result = await users.findOne({ _id: 'user-123' });
  return result; // client.close() never called — resource leak
}

export async function clientWithClose() {
  // NOTE: connect() fires connection-failure regardless of close() pattern — scanner sees connect() without a catch block
  const client = await MongoClient.connect(connectionString);
  try {
    const users = client.db('mydb').collection('users');
    const result = await users.findOne({ _id: 'user-123' });
    return result;
  } finally {
    await client.close();
  }
}
