/**
 * mongodb Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "mongodb"):
 *   - MongoClient.connect()       postcondition: connection-failure
 *   - users.find()                postcondition: query-failure
 *   - users.findOneAndUpdate()    postconditions: findoneandupdate-null-not-found, findoneandupdate-write-concern-error
 *   - users.findOneAndDelete()    postconditions: findoneanddelete-null-not-found
 *   - users.findOneAndReplace()   postconditions: findoneandreplace-null-not-found
 *   - session.withTransaction()   postconditions: withtransaction-transient-error-not-retried-externally
 *   - collection.watch()          postconditions: watch-error-event-not-thrown
 *   - collection.replaceOne()     postconditions: replaceone-network-error
 *   - client.close()              postconditions: close-not-called-resource-leak
 *   - collection.dropIndex()      postconditions: dropindex-not-found
 *   --- Added deepen-stream-2 pass 13 (2026-04-17) ---
 *   - db.createCollection()       postconditions: createcollection-namespace-exists, createcollection-validation-schema-error
 *   - collection.distinct()       postcondition: distinct-no-try-catch
 *   - collection.createIndexes()  postcondition: createindexes-options-conflict
 *   - collection.dropIndexes()    postcondition: dropindexes-namespace-not-found
 *   - client.withSession()        postconditions: withsession-callback-error-propagates, withsession-operations-missing-session
 *   - collection.rename()         postconditions: rename-target-exists, rename-no-try-catch
 *
 * Detection path: MongoClient.connect → InstanceTracker fires →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { MongoClient, Collection, Db } from 'mongodb';

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
  // SHOULD_FIRE: query-failure — find() without try-catch; scanner detects collection method calls
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
  // SHOULD_FIRE: findoneandupdate-null-not-found — findOneAndUpdate() without null check; result may be null
  const result = await users.findOneAndUpdate(
    { _id: 'user-123' },
    { $set: { status: 'active' } },
    { returnDocument: 'after' }
  );
  return result.status; // null if not found — non-optional property access on potentially-null result
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
  // SHOULD_FIRE: findoneanddelete-null-not-found — findOneAndDelete() without null check; result may be null
  const deleted = await users.findOneAndDelete({ _id: 'user-123' });
  return deleted._id; // null if not found — non-optional property access on potentially-null result
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
  // SHOULD_FIRE: findoneandreplace-null-not-found — findOneAndReplace() without null check; result may be null
  const result = await users.findOneAndReplace(
    { _id: 'user-123' },
    { name: 'New Name', status: 'active' }
  );
  return result.name; // null if not found — non-optional property access on potentially-null result
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
  // SHOULD_FIRE: replaceone-validation-failure — replaceOne() without try-catch
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
  // SHOULD_FIRE: dropindex-not-found — dropIndex() without try-catch
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

// ─────────────────────────────────────────────────────────────────────────────
// 9. db.createCollection() — without try-catch (namespace exists)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: createcollection-namespace-exists
// @expect-violation: createcollection-validation-schema-error
export async function createCollectionNoCatch(db: Db) {
  // SHOULD_FIRE: createcollection-namespace-exists — createCollection() without try-catch
  await db.createCollection('users');
}

// @expect-clean
export async function createCollectionWithCatch(db: Db) {
  try {
    // SHOULD_NOT_FIRE: createCollection inside try-catch with idempotent handling
    await db.createCollection('users', {
      validator: { $jsonSchema: { bsonType: 'object', required: ['email'] } }
    });
  } catch (err: any) {
    if (err?.code === 48) {
      // NamespaceExists — collection already exists, safe to continue
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. collection.distinct() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: distinct-no-try-catch
export async function distinctNoCatch(users: Collection) {
  // SHOULD_FIRE: distinct-no-try-catch — distinct() without try-catch
  const categories = await users.distinct('category', { status: 'active' });
  return categories;
}

// @expect-clean
export async function distinctWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: distinct inside try-catch
    const categories = await users.distinct('category', { status: 'active' });
    return categories;
  } catch (err) {
    console.error('distinct failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. collection.createIndexes() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: createindexes-options-conflict
export async function createIndexesNoCatch(users: Collection) {
  // SHOULD_FIRE: createindexes-options-conflict — createIndexes() without try-catch
  await users.createIndexes([
    { key: { email: 1 }, name: 'email_unique', unique: true },
    { key: { createdAt: -1 }, name: 'created_at_desc' }
  ]);
}

// @expect-clean
export async function createIndexesWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: createIndexes inside try-catch
    await users.createIndexes([
      { key: { email: 1 }, name: 'email_unique', unique: true },
      { key: { createdAt: -1 }, name: 'created_at_desc' }
    ]);
  } catch (err: any) {
    if (err?.code === 85 || err?.code === 86) {
      console.error('Index conflict:', err.message);
      throw err;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. collection.dropIndexes() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dropindexes-namespace-not-found
export async function dropIndexesNoCatch(users: Collection) {
  // SHOULD_FIRE: dropindexes-namespace-not-found — dropIndexes() without try-catch
  await users.dropIndexes();
}

// @expect-clean
export async function dropIndexesWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: dropIndexes inside try-catch
    await users.dropIndexes();
  } catch (err: any) {
    if (err?.code === 26) {
      // NamespaceNotFound — collection doesn't exist, skip
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. client.withSession() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: withsession-callback-error-propagates
export async function withSessionNoCatch(client: MongoClient, users: Collection) {
  // SHOULD_FIRE: withsession-callback-error-propagates — withSession() without try-catch
  await client.withSession(async (session) => {
    await users.findOne({ _id: 'user-123' }, { session });
  });
}

// @expect-clean
export async function withSessionWithCatch(client: MongoClient, users: Collection) {
  try {
    // SHOULD_NOT_FIRE: withSession inside try-catch with session passed to operations
    await client.withSession(async (session) => {
      const result = await users.findOne({ _id: 'user-123' }, { session });
      return result;
    });
  } catch (err) {
    console.error('Session operation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. collection.rename() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: rename-target-exists
// @expect-violation: rename-no-try-catch
export async function renameNoCatch(users: Collection) {
  // SHOULD_FIRE: rename-target-exists — rename() without try-catch
  await users.rename('users_archive');
}

// @expect-clean
export async function renameWithCatch(users: Collection) {
  try {
    // SHOULD_NOT_FIRE: rename inside try-catch
    await users.rename('users_archive', { dropTarget: false });
  } catch (err: any) {
    if (err?.code === 26) {
      throw new Error('Source collection does not exist for rename');
    }
    throw err;
  }
}
