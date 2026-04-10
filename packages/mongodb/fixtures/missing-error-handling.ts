/**
 * MongoDB Missing Error Handling Fixtures
 *
 * These examples demonstrate INCORRECT patterns - missing try-catch blocks.
 * Expected violations: Multiple ERROR violations
 */

import { MongoClient, Db, Collection } from 'mongodb';

const connectionString = 'mongodb://localhost:27017';
const dbName = 'testdb';

/**
 * ❌ Missing: Connection without try-catch
 * Should trigger ERROR violation
 */
async function connectWithoutErrorHandling() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db(dbName);
  console.log('Connected');
  return { client, db };
}

/**
 * ❌ Missing: Find operation without error handling
 * Should trigger ERROR violation
 */
async function findDocumentsWithoutErrorHandling(collection: Collection) {
  const documents = await collection.find({ status: 'active' }).toArray();
  return documents;
}

/**
 * ❌ Missing: FindOne without error handling
 * Should trigger ERROR violation
 */
async function findOneWithoutErrorHandling(collection: Collection) {
  const document = await collection.findOne({ _id: 'test-id' });
  return document;
}

/**
 * ❌ Missing: InsertOne without error handling
 * Should trigger ERROR violation
 */
async function insertWithoutErrorHandling(collection: Collection) {
  const result = await collection.insertOne({
    name: 'Test',
    createdAt: new Date()
  });
  return result;
}

/**
 * ❌ Missing: InsertMany without error handling
 * Should trigger ERROR violation
 */
async function insertManyWithoutErrorHandling(collection: Collection) {
  const result = await collection.insertMany([
    { name: 'Doc1' },
    { name: 'Doc2' },
    { name: 'Doc3' }
  ]);
  return result;
}

/**
 * ❌ Missing: UpdateOne without error handling
 * Should trigger ERROR violation
 */
async function updateOneWithoutErrorHandling(collection: Collection) {
  const result = await collection.updateOne(
    { _id: 'test-id' },
    { $set: { status: 'updated' } }
  );
  return result;
}

/**
 * ❌ Missing: UpdateMany without error handling
 * Should trigger ERROR violation
 */
async function updateManyWithoutErrorHandling(collection: Collection) {
  const result = await collection.updateMany(
    { status: 'pending' },
    { $set: { status: 'processed' } }
  );
  return result;
}

/**
 * ❌ Missing: DeleteOne without error handling
 * Should trigger ERROR violation
 */
async function deleteOneWithoutErrorHandling(collection: Collection) {
  const result = await collection.deleteOne({ _id: 'test-id' });
  return result;
}

/**
 * ❌ Missing: DeleteMany without error handling
 * Should trigger ERROR violation
 */
async function deleteManyWithoutErrorHandling(collection: Collection) {
  const result = await collection.deleteMany({ status: 'archived' });
  return result;
}

/**
 * ❌ Missing: Aggregate without error handling
 * Should trigger ERROR violation
 */
async function aggregateWithoutErrorHandling(collection: Collection) {
  const results = await collection.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]).toArray();
  return results;
}

/**
 * ❌ Missing: CountDocuments without error handling
 * Should trigger ERROR violation
 */
async function countWithoutErrorHandling(collection: Collection) {
  const count = await collection.countDocuments({ status: 'active' });
  return count;
}

/**
 * ❌ Missing: CreateIndex without error handling
 * Should trigger ERROR violation
 */
async function createIndexWithoutErrorHandling(collection: Collection) {
  const indexName = await collection.createIndex({ email: 1 }, { unique: true });
  return indexName;
}

/**
 * ❌ Missing: Drop collection without error handling
 * Should trigger ERROR violation
 */
async function dropCollectionWithoutErrorHandling(collection: Collection) {
  await collection.drop();
  console.log('Collection dropped');
}

/**
 * ❌ Missing: Get collection without error handling
 * Should trigger ERROR violation
 */
async function getCollectionWithoutErrorHandling(db: Db) {
  const collection = db.collection('users');
  return collection;
}

/**
 * ❌ Missing: Complete workflow without error handling
 * Should trigger multiple ERROR violations
 */
async function workflowWithoutErrorHandling() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db(dbName);
  const collection = db.collection('users');

  await collection.insertOne({ name: 'Alice', email: 'alice@example.com' });
  const user = await collection.findOne({ name: 'Alice' });
  await collection.updateOne({ name: 'Alice' }, { $set: { status: 'active' } });
  const count = await collection.countDocuments({ status: 'active' });

  console.log(`Active users: ${count}`);
  await client.close();
}

/**
 * ❌ Missing: Multiple operations without error handling
 * Should trigger multiple ERROR violations
 */
async function multipleOperationsWithoutHandling(collection: Collection) {
  // Multiple operations, none with error handling
  await collection.insertOne({ name: 'Bob' });
  await collection.findOne({ name: 'Bob' });
  await collection.updateOne({ name: 'Bob' }, { $set: { age: 30 } });
  await collection.deleteOne({ name: 'Bob' });
}

/**
 * ❌ Missing: Chained operations without error handling
 * Should trigger ERROR violations
 */
async function chainedOperationsWithoutHandling(db: Db) {
  const result = await db
    .collection('users')
    .find({ status: 'active' })
    .toArray();

  return result;
}

/**
 * ❌ Missing: Aggregation pipeline without error handling
 * Should trigger ERROR violation
 */
async function complexAggregationWithoutHandling(collection: Collection) {
  const results = await collection.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$department', total: { $sum: '$salary' } } },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]).toArray();

  return results;
}

/**
 * ❌ Missing: Bulk write operations without error handling
 * Should trigger ERROR violation
 */
async function bulkWriteWithoutHandling(collection: Collection) {
  const operations = [
    { insertOne: { document: { name: 'User1' } } },
    { updateOne: { filter: { name: 'User2' }, update: { $set: { status: 'active' } } } },
    { deleteOne: { filter: { name: 'User3' } } }
  ];

  const result = await collection.bulkWrite(operations);
  return result;
}

/**
 * ❌ Missing: Connection with operations, no error handling
 * Should trigger multiple ERROR violations
 */
async function connectAndQueryWithoutHandling() {
  const client = await MongoClient.connect(connectionString);
  const db = client.db(dbName);
  const users = db.collection('users');

  // Multiple unhandled operations
  const allUsers = await users.find({}).toArray();
  const activeCount = await users.countDocuments({ status: 'active' });
  await users.createIndex({ email: 1 });

  await client.close();

  return { allUsers, activeCount };
}

/**
 * ❌ Missing: Promise chaining without error handling
 * Should trigger ERROR violations
 */
async function promiseChainingWithoutHandling() {
  const client = await MongoClient.connect(connectionString);

  return client
    .db(dbName)
    .collection('users')
    .find({ status: 'active' })
    .toArray();
}

export {
  connectWithoutErrorHandling,
  findDocumentsWithoutErrorHandling,
  findOneWithoutErrorHandling,
  insertWithoutErrorHandling,
  insertManyWithoutErrorHandling,
  updateOneWithoutErrorHandling,
  updateManyWithoutErrorHandling,
  deleteOneWithoutErrorHandling,
  deleteManyWithoutErrorHandling,
  aggregateWithoutErrorHandling,
  countWithoutErrorHandling,
  createIndexWithoutErrorHandling,
  dropCollectionWithoutErrorHandling,
  getCollectionWithoutErrorHandling,
  workflowWithoutErrorHandling,
  multipleOperationsWithoutHandling,
  chainedOperationsWithoutHandling,
  complexAggregationWithoutHandling,
  bulkWriteWithoutHandling,
  connectAndQueryWithoutHandling,
  promiseChainingWithoutHandling
};
