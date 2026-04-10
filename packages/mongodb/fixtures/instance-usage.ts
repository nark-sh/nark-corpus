/**
 * MongoDB Instance Usage Fixtures
 *
 * Tests detection of MongoDB operations via instances (client, db, collection).
 * Expected violations: ERROR violations for operations without try-catch
 */

import { MongoClient, Db, Collection } from 'mongodb';

const connectionString = 'mongodb://localhost:27017';

/**
 * ❌ Instance pattern: Client assigned to variable, operations without error handling
 * Should detect violations
 */
async function clientInstanceWithoutHandling() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db('testdb');
  const users = db.collection('users');

  // These should be detected as violations
  await users.find({}).toArray();
  await users.insertOne({ name: 'Test' });
  await users.updateOne({ name: 'Test' }, { $set: { status: 'active' } });

  await client.close();
}

/**
 * ✅ Instance pattern: Same operations with proper error handling
 * Should have 0 violations
 */
async function clientInstanceWithHandling() {
  try {
    const client = await MongoClient.connect(connectionString);
    const db = client.db('testdb');
    const users = db.collection('users');

    await users.find({}).toArray();
    await users.insertOne({ name: 'Test' });
    await users.updateOne({ name: 'Test' }, { $set: { status: 'active' } });

    await client.close();
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}

/**
 * ❌ Collection instance stored in class property, no error handling
 * Should detect violations
 */
class UserRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('users');
  }

  async findAll() {
    // ❌ No try-catch - should trigger violation
    return await this.collection.find({}).toArray();
  }

  async insert(user: any) {
    // ❌ No try-catch - should trigger violation
    return await this.collection.insertOne(user);
  }

  async update(id: string, data: any) {
    // ❌ No try-catch - should trigger violation
    return await this.collection.updateOne({ _id: id }, { $set: data });
  }

  async delete(id: string) {
    // ❌ No try-catch - should trigger violation
    return await this.collection.deleteOne({ _id: id });
  }

  async count() {
    // ❌ No try-catch - should trigger violation
    return await this.collection.countDocuments({});
  }
}

/**
 * ✅ Collection instance with proper error handling in methods
 * Should have 0 violations
 */
class SafeUserRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('users');
  }

  async findAll() {
    try {
      return await this.collection.find({}).toArray();
    } catch (error) {
      console.error('Find all failed:', error);
      throw error;
    }
  }

  async insert(user: any) {
    try {
      return await this.collection.insertOne(user);
    } catch (error) {
      console.error('Insert failed:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      return await this.collection.updateOne({ _id: id }, { $set: data });
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.collection.deleteOne({ _id: id });
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  async count() {
    try {
      return await this.collection.countDocuments({});
    } catch (error) {
      console.error('Count failed:', error);
      throw error;
    }
  }
}

/**
 * ❌ Database instance pattern without error handling
 * Should detect violations
 */
async function dbInstancePattern() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db('myapp');

  // These db.collection() calls should be detected
  const users = db.collection('users');
  const posts = db.collection('posts');

  // These operations should be detected as violations
  await users.findOne({ email: 'test@example.com' });
  await posts.insertMany([{ title: 'Post 1' }, { title: 'Post 2' }]);

  await client.close();
}

/**
 * ❌ Function returning collection without error handling usage
 * Should detect violations in actual operations
 */
function getCollection(db: Db, name: string): Collection {
  return db.collection(name);
}

async function useCollectionWithoutHandling(db: Db) {
  const users = getCollection(db, 'users');

  // ❌ No try-catch - should trigger violation
  await users.find({}).toArray();
  await users.insertOne({ name: 'User' });
}

/**
 * ✅ Function returning collection with proper error handling in usage
 * Should have 0 violations
 */
async function useCollectionWithHandling(db: Db) {
  try {
    const users = getCollection(db, 'users');
    await users.find({}).toArray();
    await users.insertOne({ name: 'User' });
  } catch (error) {
    console.error('Operations failed:', error);
    throw error;
  }
}

/**
 * ❌ Multiple collection instances without error handling
 * Should detect multiple violations
 */
async function multipleCollectionInstances() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db('testdb');

  const collection1 = db.collection('users');
  const collection2 = db.collection('posts');
  const collection3 = db.collection('comments');

  // All these should trigger violations
  await collection1.find({}).toArray();
  await collection2.aggregate([{ $match: {} }]).toArray();
  await collection3.countDocuments({});

  await client.close();
}

/**
 * ❌ Collection instance in closure without error handling
 * Should detect violations
 */
function createCollectionOperations(collection: Collection) {
  return {
    findAll: async () => {
      // ❌ No try-catch
      return await collection.find({}).toArray();
    },
    insert: async (doc: any) => {
      // ❌ No try-catch
      return await collection.insertOne(doc);
    },
    update: async (filter: any, update: any) => {
      // ❌ No try-catch
      return await collection.updateOne(filter, update);
    }
  };
}

/**
 * ✅ Collection instance in closure with proper error handling
 * Should have 0 violations
 */
function createSafeCollectionOperations(collection: Collection) {
  return {
    findAll: async () => {
      try {
        return await collection.find({}).toArray();
      } catch (error) {
        console.error('Find failed:', error);
        throw error;
      }
    },
    insert: async (doc: any) => {
      try {
        return await collection.insertOne(doc);
      } catch (error) {
        console.error('Insert failed:', error);
        throw error;
      }
    },
    update: async (filter: any, update: any) => {
      try {
        return await collection.updateOne(filter, update);
      } catch (error) {
        console.error('Update failed:', error);
        throw error;
      }
    }
  };
}

/**
 * ❌ Mixed: Some operations with handling, some without
 * Should detect violations only for unhandled operations
 */
async function mixedErrorHandling(collection: Collection) {
  // ✅ This one has error handling
  try {
    await collection.find({}).toArray();
  } catch (error) {
    console.error('Find failed:', error);
  }

  // ❌ This one doesn't - should trigger violation
  await collection.insertOne({ name: 'Test' });

  // ✅ This one has error handling
  try {
    await collection.updateOne({ name: 'Test' }, { $set: { status: 'active' } });
  } catch (error) {
    console.error('Update failed:', error);
  }

  // ❌ This one doesn't - should trigger violation
  await collection.deleteOne({ name: 'Test' });
}

/**
 * ❌ Async function with instance tracking across multiple calls
 * Should detect violations
 */
async function instanceTrackingAcrossCalls() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db('testdb');

  // Get collection
  const users = db.collection('users');

  // Do some work
  await users.insertOne({ name: 'Alice' });

  // Get another collection
  const posts = db.collection('posts');

  // More work - both should be detected as violations
  await users.find({}).toArray();
  await posts.aggregate([{ $match: {} }]).toArray();

  await client.close();
}

export {
  clientInstanceWithoutHandling,
  clientInstanceWithHandling,
  UserRepository,
  SafeUserRepository,
  dbInstancePattern,
  useCollectionWithoutHandling,
  useCollectionWithHandling,
  multipleCollectionInstances,
  createCollectionOperations,
  createSafeCollectionOperations,
  mixedErrorHandling,
  instanceTrackingAcrossCalls
};
