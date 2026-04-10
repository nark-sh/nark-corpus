/**
 * MongoDB Proper Error Handling Fixtures
 *
 * These examples demonstrate CORRECT error handling patterns for MongoDB operations.
 * Expected violations: 0
 */

import { MongoClient, Db, Collection } from 'mongodb';

const connectionString = 'mongodb://localhost:27017';
const dbName = 'testdb';

/**
 * ✅ Proper: Connection with try-catch
 */
async function connectWithProperErrorHandling() {
  try {
    const client = await MongoClient.connect(connectionString);
    const db = client.db(dbName);
    console.log('Connected successfully');
    return { client, db };
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: Find operation with error handling
 */
async function findDocumentsWithErrorHandling(collection: Collection) {
  try {
    const documents = await collection.find({ status: 'active' }).toArray();
    return documents;
  } catch (error) {
    console.error('Find operation failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: FindOne operation with error handling
 */
async function findOneWithErrorHandling(collection: Collection) {
  try {
    const document = await collection.findOne({ _id: 'test-id' });
    return document;
  } catch (error) {
    console.error('FindOne operation failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: InsertOne with error handling
 */
async function insertWithErrorHandling(collection: Collection) {
  try {
    const result = await collection.insertOne({
      name: 'Test',
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: InsertMany with error handling
 */
async function insertManyWithErrorHandling(collection: Collection) {
  try {
    const result = await collection.insertMany([
      { name: 'Doc1' },
      { name: 'Doc2' },
      { name: 'Doc3' }
    ]);
    return result;
  } catch (error) {
    console.error('Bulk insert failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: UpdateOne with error handling
 */
async function updateOneWithErrorHandling(collection: Collection) {
  try {
    const result = await collection.updateOne(
      { _id: 'test-id' },
      { $set: { status: 'updated' } }
    );
    return result;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: UpdateMany with error handling
 */
async function updateManyWithErrorHandling(collection: Collection) {
  try {
    const result = await collection.updateMany(
      { status: 'pending' },
      { $set: { status: 'processed' } }
    );
    return result;
  } catch (error) {
    console.error('Bulk update failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: DeleteOne with error handling
 */
async function deleteOneWithErrorHandling(collection: Collection) {
  try {
    const result = await collection.deleteOne({ _id: 'test-id' });
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: DeleteMany with error handling
 */
async function deleteManyWithErrorHandling(collection: Collection) {
  try {
    const result = await collection.deleteMany({ status: 'archived' });
    return result;
  } catch (error) {
    console.error('Bulk delete failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: Aggregate with error handling
 */
async function aggregateWithErrorHandling(collection: Collection) {
  try {
    const results = await collection.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    return results;
  } catch (error) {
    console.error('Aggregation failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: CountDocuments with error handling
 */
async function countWithErrorHandling(collection: Collection) {
  try {
    const count = await collection.countDocuments({ status: 'active' });
    return count;
  } catch (error) {
    console.error('Count failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: CreateIndex with error handling
 */
async function createIndexWithErrorHandling(collection: Collection) {
  try {
    const indexName = await collection.createIndex({ email: 1 }, { unique: true });
    return indexName;
  } catch (error) {
    console.error('Index creation failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: Drop collection with error handling
 */
async function dropCollectionWithErrorHandling(collection: Collection) {
  try {
    await collection.drop();
    console.log('Collection dropped');
  } catch (error) {
    console.error('Drop failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper: Get collection with error handling
 */
async function getCollectionWithErrorHandling(db: Db) {
  try {
    const collection = db.collection('users');
    return collection;
  } catch (error) {
    console.error('Failed to get collection:', error);
    throw error;
  }
}

/**
 * ✅ Proper: Complete workflow with error handling
 */
async function completeWorkflow() {
  let client: MongoClient | null = null;

  try {
    // Connect
    client = await MongoClient.connect(connectionString);
    const db = client.db(dbName);

    // Get collection
    const collection = db.collection('users');

    // Insert document
    await collection.insertOne({ name: 'Alice', email: 'alice@example.com' });

    // Find document
    const user = await collection.findOne({ name: 'Alice' });

    // Update document
    await collection.updateOne({ name: 'Alice' }, { $set: { status: 'active' } });

    // Count documents
    const count = await collection.countDocuments({ status: 'active' });

    console.log(`Workflow complete. Active users: ${count}`);

  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  } finally {
    // Always close connection
    if (client) {
      await client.close();
    }
  }
}

/**
 * ✅ Proper: Error handling with specific error types
 */
async function handleSpecificErrors(collection: Collection) {
  try {
    await collection.insertOne({ email: 'duplicate@example.com' });
  } catch (error: any) {
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.message);
      // Handle duplicate key specifically
    } else {
      console.error('Insert failed:', error);
      throw error;
    }
  }
}

/**
 * ✅ Proper: Transient error detection and retry
 */
async function handleTransientErrors(collection: Collection) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await collection.find({}).toArray();
      return result;
    } catch (error: any) {
      attempt++;

      // Check for transient errors using hasErrorLabel
      if (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) {
        console.log(`Transient error, retrying... (attempt ${attempt}/${maxRetries})`);
        if (attempt >= maxRetries) {
          throw error;
        }
        continue;
      }

      // Non-transient error, throw immediately
      throw error;
    }
  }
}

export {
  connectWithProperErrorHandling,
  findDocumentsWithErrorHandling,
  findOneWithErrorHandling,
  insertWithErrorHandling,
  insertManyWithErrorHandling,
  updateOneWithErrorHandling,
  updateManyWithErrorHandling,
  deleteOneWithErrorHandling,
  deleteManyWithErrorHandling,
  aggregateWithErrorHandling,
  countWithErrorHandling,
  createIndexWithErrorHandling,
  dropCollectionWithErrorHandling,
  getCollectionWithErrorHandling,
  completeWorkflow,
  handleSpecificErrors,
  handleTransientErrors
};
