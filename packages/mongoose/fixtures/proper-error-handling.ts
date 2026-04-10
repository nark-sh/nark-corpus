/**
 * Mongoose Test Fixtures - Proper Error Handling
 *
 * This file demonstrates CORRECT error handling patterns for mongoose operations.
 * All async operations are wrapped in try-catch blocks or use .catch() handlers.
 *
 * Expected: 0 violations
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

// ✅ Query Operations with Try-Catch

async function findAllUsersProper() {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.error('Error finding users:', error);
    throw error;
  }
}

async function findOneUserProper(email: string) {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

async function findUserByIdProper(id: string) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      console.error('Invalid ObjectId format');
    }
    throw error;
  }
}

// ✅ Create Operations with Try-Catch

async function createUserProper(data: Partial<IUser>) {
  try {
    const user = await User.create(data);
    return user;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      console.error('Validation failed:', error.errors);
    } else if (error.code === 11000) {
      console.error('Duplicate key error - email already exists');
    }
    throw error;
  }
}

async function createMultipleUsersProper(users: Partial<IUser>[]) {
  try {
    const result = await User.insertMany(users);
    return result;
  } catch (error: any) {
    console.error('Bulk insert failed:', error);
    throw error;
  }
}

// ✅ Update Operations with Try-Catch

async function updateOneUserProper(id: string, data: Partial<IUser>) {
  try {
    const result = await User.updateOne({ _id: id }, data);
    return result;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

async function updateManyUsersProper(filter: any, update: Partial<IUser>) {
  try {
    const result = await User.updateMany(filter, update);
    return result;
  } catch (error) {
    console.error('Bulk update failed:', error);
    throw error;
  }
}

async function findAndUpdateUserProper(id: string, data: Partial<IUser>) {
  try {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    return user;
  } catch (error) {
    console.error('Find and update failed:', error);
    throw error;
  }
}

async function findOneAndUpdateUserProper(email: string, data: Partial<IUser>) {
  try {
    const user = await User.findOneAndUpdate({ email }, data, { new: true });
    return user;
  } catch (error) {
    console.error('Find one and update failed:', error);
    throw error;
  }
}

// ✅ Delete Operations with Try-Catch

async function deleteOneUserProper(id: string) {
  try {
    const result = await User.deleteOne({ _id: id });
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

async function deleteManyUsersProper(filter: any) {
  try {
    const result = await User.deleteMany(filter);
    return result;
  } catch (error) {
    console.error('Bulk delete failed:', error);
    throw error;
  }
}

async function findAndDeleteUserProper(id: string) {
  try {
    const user = await User.findByIdAndDelete(id);
    return user;
  } catch (error) {
    console.error('Find and delete failed:', error);
    throw error;
  }
}

async function findOneAndDeleteUserProper(email: string) {
  try {
    const user = await User.findOneAndDelete({ email });
    return user;
  } catch (error) {
    console.error('Find one and delete failed:', error);
    throw error;
  }
}

// ✅ Query Methods with Try-Catch

async function executeQueryProper() {
  try {
    const users = await User.find({ active: true }).limit(10).exec();
    return users;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

async function executeWithOrFailProper(id: string) {
  try {
    const user = await User.findById(id).orFail();
    return user;
  } catch (error) {
    if (error instanceof Error && error.name === 'DocumentNotFoundError') {
      console.error('User not found');
    }
    throw error;
  }
}

// ✅ Aggregation Operations with Try-Catch

async function aggregateUsersProper() {
  try {
    const result = await User.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$age', count: { $sum: 1 } } }
    ]);
    return result;
  } catch (error) {
    console.error('Aggregation failed:', error);
    throw error;
  }
}

async function countUsersProper() {
  try {
    const count = await User.countDocuments({ active: true });
    return count;
  } catch (error) {
    console.error('Count failed:', error);
    throw error;
  }
}

async function estimateCountProper() {
  try {
    const count = await User.estimatedDocumentCount();
    return count;
  } catch (error) {
    console.error('Estimated count failed:', error);
    throw error;
  }
}

// ✅ Connection Operations with Try-Catch

async function connectToMongoDBProper() {
  try {
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

async function closeConnectionProper() {
  try {
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error closing connection:', error);
    throw error;
  }
}

// ✅ Promise .catch() Pattern (Alternative to Try-Catch)

function findUserWithCatch(id: string) {
  return User.findById(id)
    .then(user => {
      console.log('User found:', user);
      return user;
    })
    .catch(error => {
      console.error('Error finding user:', error);
      throw error;
    });
}

function createUserWithCatch(data: Partial<IUser>) {
  return User.create(data)
    .then(user => {
      console.log('User created:', user);
      return user;
    })
    .catch(error => {
      console.error('Error creating user:', error);
      throw error;
    });
}

// ✅ Chained Query with Try-Catch

async function chainedQueryProper(email: string) {
  try {
    const user = await User.findOne({ email })
      .select('name email')
      .limit(1)
      .exec();
    return user;
  } catch (error) {
    console.error('Chained query failed:', error);
    throw error;
  }
}

// ✅ Additional Methods with Try-Catch

async function checkUserExistsProper(email: string) {
  try {
    const exists = await User.exists({ email });
    return exists;
  } catch (error) {
    console.error('Exists check failed:', error);
    throw error;
  }
}

async function getDistinctValuesProper() {
  try {
    const ages = await User.distinct('age');
    return ages;
  } catch (error) {
    console.error('Distinct query failed:', error);
    throw error;
  }
}

async function bulkWriteProper(operations: any[]) {
  try {
    const result = await User.bulkWrite(operations);
    return result;
  } catch (error) {
    console.error('Bulk write failed:', error);
    throw error;
  }
}

// Export all functions
export {
  findAllUsersProper,
  findOneUserProper,
  findUserByIdProper,
  createUserProper,
  createMultipleUsersProper,
  updateOneUserProper,
  updateManyUsersProper,
  findAndUpdateUserProper,
  findOneAndUpdateUserProper,
  deleteOneUserProper,
  deleteManyUsersProper,
  findAndDeleteUserProper,
  findOneAndDeleteUserProper,
  executeQueryProper,
  executeWithOrFailProper,
  aggregateUsersProper,
  countUsersProper,
  estimateCountProper,
  connectToMongoDBProper,
  closeConnectionProper,
  findUserWithCatch,
  createUserWithCatch,
  chainedQueryProper,
  checkUserExistsProper,
  getDistinctValuesProper,
  bulkWriteProper
};
