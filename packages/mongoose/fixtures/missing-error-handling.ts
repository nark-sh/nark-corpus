/**
 * Mongoose Test Fixtures - Missing Error Handling
 *
 * This file demonstrates INCORRECT error handling patterns for mongoose operations.
 * Async operations are NOT wrapped in try-catch blocks or .catch() handlers.
 *
 * Expected: Multiple ERROR violations (one for each missing try-catch)
 */

import mongoose, { Model, Document, Schema } from 'mongoose';

// Define interfaces and schemas
interface IUser extends Document {
  email: string;
  name: string;
  age: number;
  active: boolean;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  active: { type: Boolean, default: true }
});

const User = mongoose.model<IUser>('User', userSchema);

// ❌ Query Operations WITHOUT Try-Catch

async function findAllUsersMissing() {
  // ❌ No error handling - will crash if connection fails
  const users = await User.find();
  return users;
}

async function findOneUserMissing(email: string) {
  // ❌ No error handling - will crash on query error
  const user = await User.findOne({ email });
  return user;
}

async function findUserByIdMissing(id: string) {
  // ❌ No error handling - will crash on invalid ObjectId
  const user = await User.findById(id);
  return user;
}

// ❌ Create Operations WITHOUT Try-Catch

async function createUserMissing(data: Partial<IUser>) {
  // ❌ No error handling - will crash on validation error or duplicate key
  const user = await User.create(data);
  return user;
}

async function createMultipleUsersMissing(users: Partial<IUser>[]) {
  // ❌ No error handling - will crash on bulk insert failure
  const result = await User.insertMany(users);
  return result;
}

// ❌ Update Operations WITHOUT Try-Catch

async function updateOneUserMissing(id: string, data: Partial<IUser>) {
  // ❌ No error handling - will crash on update failure
  const result = await User.updateOne({ _id: id }, data);
  return result;
}

async function updateManyUsersMissing(filter: any, update: Partial<IUser>) {
  // ❌ No error handling - will crash on bulk update failure
  const result = await User.updateMany(filter, update);
  return result;
}

async function findAndUpdateUserMissing(id: string, data: Partial<IUser>) {
  // ❌ No error handling - vulnerable to CVE-2023-3696
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  return user;
}

async function findOneAndUpdateUserMissing(email: string, data: Partial<IUser>) {
  // ❌ No error handling - vulnerable to CVE-2023-3696
  const user = await User.findOneAndUpdate({ email }, data, { new: true });
  return user;
}

async function replaceOneUserMissing(id: string, data: Partial<IUser>) {
  // ❌ No error handling
  const result = await User.replaceOne({ _id: id }, data);
  return result;
}

async function findOneAndReplaceMissing(email: string, data: Partial<IUser>) {
  // ❌ No error handling
  const user = await User.findOneAndReplace({ email }, data);
  return user;
}

// ❌ Delete Operations WITHOUT Try-Catch

async function deleteOneUserMissing(id: string) {
  // ❌ No error handling
  const result = await User.deleteOne({ _id: id });
  return result;
}

async function deleteManyUsersMissing(filter: any) {
  // ❌ No error handling
  const result = await User.deleteMany(filter);
  return result;
}

async function findAndDeleteUserMissing(id: string) {
  // ❌ No error handling
  const user = await User.findByIdAndDelete(id);
  return user;
}

async function findOneAndDeleteUserMissing(email: string) {
  // ❌ No error handling
  const user = await User.findOneAndDelete({ email });
  return user;
}

// NOTE: Model.findByIdAndRemove() was deprecated in mongoose >= 7.x
// This test case has been removed to avoid TypeScript compilation errors

// ❌ Query Methods WITHOUT Try-Catch

async function executeQueryMissing() {
  // ❌ No error handling on .exec()
  const users = await User.find({ active: true }).limit(10).exec();
  return users;
}

async function executeWithOrFailMissing(id: string) {
  // ❌ No error handling - orFail() will throw but not caught
  const user = await User.findById(id).orFail();
  return user;
}

// ❌ Aggregation Operations WITHOUT Try-Catch

async function aggregateUsersMissing() {
  // ❌ No error handling
  const result = await User.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$age', count: { $sum: 1 } } }
  ]);
  return result;
}

async function countUsersMissing() {
  // ❌ No error handling
  const count = await User.countDocuments({ active: true });
  return count;
}

async function estimateCountMissing() {
  // ❌ No error handling
  const count = await User.estimatedDocumentCount();
  return count;
}

// ❌ Connection Operations WITHOUT Try-Catch

async function connectToMongoDBMissing() {
  // ❌ No error handling - will crash on connection failure
  await mongoose.connect('mongodb://localhost:27017/test');
  console.log('Connected to MongoDB');
}

async function closeConnectionMissing() {
  // ❌ No error handling
  await mongoose.connection.close();
  console.log('Connection closed');
}

// ❌ Promise WITHOUT .catch() Handler

function findUserWithoutCatch(id: string) {
  // ❌ No .catch() handler - unhandled promise rejection
  return User.findById(id)
    .then(user => {
      console.log('User found:', user);
      return user;
    });
  // Missing .catch() here!
}

function createUserWithoutCatch(data: Partial<IUser>) {
  // ❌ No .catch() handler - unhandled promise rejection
  return User.create(data)
    .then(user => {
      console.log('User created:', user);
      return user;
    });
  // Missing .catch() here!
}

// ❌ Chained Query WITHOUT Try-Catch

async function chainedQueryMissing(email: string) {
  // ❌ No error handling on chained query
  const user = await User.findOne({ email })
    .select('name email')
    .limit(1)
    .exec();
  return user;
}

// ❌ Additional Methods WITHOUT Try-Catch

async function checkUserExistsMissing(email: string) {
  // ❌ No error handling
  const exists = await User.exists({ email });
  return exists;
}

async function getDistinctValuesMissing() {
  // ❌ No error handling
  const ages = await User.distinct('age');
  return ages;
}

async function bulkWriteMissing(operations: any[]) {
  // ❌ No error handling
  const result = await User.bulkWrite(operations);
  return result;
}

// ❌ Multiple Operations in Sequence WITHOUT Try-Catch

async function multipleOperationsMissing(email: string, data: Partial<IUser>) {
  // ❌ No error handling for either operation
  const user = await User.findOne({ email });
  if (user) {
    await User.updateOne({ _id: user._id }, data);
  }
  return user;
}

// ❌ Nested Operations WITHOUT Try-Catch

async function nestedOperationsMissing(userId: string) {
  // ❌ No error handling
  const user = await User.findById(userId);

  if (user) {
    // ❌ No error handling on nested operation
    const count = await User.countDocuments({ age: user.age });
    return { user, count };
  }

  return null;
}

// Export all functions
export {
  findAllUsersMissing,
  findOneUserMissing,
  findUserByIdMissing,
  createUserMissing,
  createMultipleUsersMissing,
  updateOneUserMissing,
  updateManyUsersMissing,
  findAndUpdateUserMissing,
  findOneAndUpdateUserMissing,
  replaceOneUserMissing,
  findOneAndReplaceMissing,
  deleteOneUserMissing,
  deleteManyUsersMissing,
  findAndDeleteUserMissing,
  findOneAndDeleteUserMissing,
  executeQueryMissing,
  executeWithOrFailMissing,
  aggregateUsersMissing,
  countUsersMissing,
  estimateCountMissing,
  connectToMongoDBMissing,
  closeConnectionMissing,
  findUserWithoutCatch,
  createUserWithoutCatch,
  chainedQueryMissing,
  checkUserExistsMissing,
  getDistinctValuesMissing,
  bulkWriteMissing,
  multipleOperationsMissing,
  nestedOperationsMissing
};
