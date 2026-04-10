/**
 * Mongoose Test Fixtures - Instance Usage Patterns
 *
 * This file tests detection of document instance methods and various usage patterns.
 * Some operations have error handling, others don't.
 *
 * Expected: Violations for operations without try-catch
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

// ✅ Document Instance Methods WITH Try-Catch (PASS)

async function saveDocumentProper(email: string, name: string, age: number) {
  try {
    const user = new User({ email, name, age });
    await user.save(); // ✅ Wrapped in try-catch
    return user;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      console.error('Validation failed:', error.errors);
    } else if (error.code === 11000) {
      console.error('Duplicate email');
    }
    throw error;
  }
}

async function validateDocumentProper(data: Partial<IUser>) {
  try {
    const user = new User(data);
    await user.validate(); // ✅ Wrapped in try-catch
    return true;
  } catch (error) {
    console.error('Validation failed:', error);
    return false;
  }
}

async function deleteDocumentProper(id: string) {
  try {
    const user = await User.findById(id);
    if (user) {
      await user.deleteOne(); // ✅ Wrapped in try-catch
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

// ❌ Document Instance Methods WITHOUT Try-Catch (ERROR)

async function saveDocumentMissing(email: string, name: string, age: number) {
  const user = new User({ email, name, age });
  // ❌ No try-catch - will crash on validation error or duplicate key
  await user.save();
  return user;
}

async function validateDocumentMissing(data: Partial<IUser>) {
  const user = new User(data);
  // ❌ No try-catch - will crash on validation error
  await user.validate();
  return true;
}

async function deleteDocumentMissing(id: string) {
  // ❌ No try-catch on findById
  const user = await User.findById(id);
  if (user) {
    // ❌ No try-catch on deleteOne
    await user.deleteOne();
  }
}

// NOTE: Document.remove() was deprecated in mongoose >= 7.x
// This test case has been removed to avoid TypeScript compilation errors

// ❌ Multiple Document Operations in Sequence

async function createAndUpdateMissing(email: string) {
  // ❌ No try-catch on create
  const user = await User.create({ email, name: 'Test', age: 25 });

  // Modify the document
  user.name = 'Updated';

  // ❌ No try-catch on save
  await user.save();

  return user;
}

async function findAndModifyMissing(id: string) {
  // ❌ No try-catch on findById
  const user = await User.findById(id);

  if (user) {
    user.age = 30;
    // ❌ No try-catch on save
    await user.save();
  }

  return user;
}

// ✅ Document Operations WITH Try-Catch (PASS)

async function createAndUpdateProper(email: string) {
  try {
    const user = await User.create({ email, name: 'Test', age: 25 });
    user.name = 'Updated';
    await user.save();
    return user;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}

async function findAndModifyProper(id: string) {
  try {
    const user = await User.findById(id);
    if (user) {
      user.age = 30;
      await user.save();
    }
    return user;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}

// ❌ Class-Based Pattern WITHOUT Try-Catch

class UserRepository {
  // ❌ No try-catch in class methods

  async findById(id: string) {
    // ❌ No error handling
    return await User.findById(id);
  }

  async create(data: Partial<IUser>) {
    // ❌ No error handling
    const user = new User(data);
    await user.save();
    return user;
  }

  async update(id: string, data: Partial<IUser>) {
    // ❌ No error handling
    const user = await User.findById(id);
    if (user) {
      Object.assign(user, data);
      await user.save();
    }
    return user;
  }

  async delete(id: string) {
    // ❌ No error handling
    const user = await User.findById(id);
    if (user) {
      await user.deleteOne();
    }
  }
}

// ✅ Class-Based Pattern WITH Try-Catch

class UserRepositoryProper {
  async findById(id: string) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Find failed:', error);
      throw error;
    }
  }

  async create(data: Partial<IUser>) {
    try {
      const user = new User(data);
      await user.save();
      return user;
    } catch (error) {
      console.error('Create failed:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IUser>) {
    try {
      const user = await User.findById(id);
      if (user) {
        Object.assign(user, data);
        await user.save();
      }
      return user;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const user = await User.findById(id);
      if (user) {
        await user.deleteOne();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}

// ❌ Middleware Pattern WITHOUT Try-Catch

async function middlewareHandlerMissing(req: any, res: any) {
  const { id } = req.params;

  // ❌ No try-catch - will crash the server
  const user = await User.findById(id);

  res.json(user);
}

async function createUserHandlerMissing(req: any, res: any) {
  const data = req.body;

  // ❌ No try-catch
  const user = await User.create(data);

  res.json(user);
}

// ✅ Middleware Pattern WITH Try-Catch

async function middlewareHandlerProper(req: any, res: any) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    console.error('Request failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUserHandlerProper(req: any, res: any) {
  try {
    const data = req.body;
    const user = await User.create(data);
    res.json(user);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// ❌ Complex Patterns WITHOUT Try-Catch

async function complexOperationMissing(userId: string) {
  // ❌ No try-catch on first operation
  const user = await User.findById(userId);

  if (user) {
    user.active = false;
    // ❌ No try-catch on save
    await user.save();

    // ❌ No try-catch on countDocuments
    const inactiveCount = await User.countDocuments({ active: false });

    return { user, inactiveCount };
  }

  return null;
}

// ✅ Complex Patterns WITH Try-Catch

async function complexOperationProper(userId: string) {
  try {
    const user = await User.findById(userId);

    if (user) {
      user.active = false;
      await user.save();

      const inactiveCount = await User.countDocuments({ active: false });

      return { user, inactiveCount };
    }

    return null;
  } catch (error) {
    console.error('Complex operation failed:', error);
    throw error;
  }
}

// Export all
export {
  saveDocumentProper,
  validateDocumentProper,
  deleteDocumentProper,
  saveDocumentMissing,
  validateDocumentMissing,
  deleteDocumentMissing,
  createAndUpdateMissing,
  findAndModifyMissing,
  createAndUpdateProper,
  findAndModifyProper,
  UserRepository,
  UserRepositoryProper,
  middlewareHandlerMissing,
  createUserHandlerMissing,
  middlewareHandlerProper,
  createUserHandlerProper,
  complexOperationMissing,
  complexOperationProper
};
