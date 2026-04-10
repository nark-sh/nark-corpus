/**
 * mongoose Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "mongoose"):
 *   - document.save()   postcondition: validation-error-no-try-catch
 *   - Model.findById()  postcondition: cast-error-no-try-catch-invalid-id
 *
 * Detection path: new Schema() + mongoose.model() → InstanceTracker tracks model →
 *   ThrowingFunctionDetector fires save()/findById() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model<IUser>('User', userSchema);

// ─────────────────────────────────────────────────────────────────────────────
// 1. document.save() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function saveNoCatch(name: string, email: string) {
  const user = new User({ name, email });
  // SHOULD_FIRE: validation-error-no-try-catch — user.save() throws on validation errors. No try-catch.
  await user.save();
  return user;
}

export async function saveWithCatch(name: string, email: string) {
  const user = new User({ name, email });
  try {
    // SHOULD_NOT_FIRE: user.save() inside try-catch satisfies error handling
    await user.save();
    return user;
  } catch (err) {
    console.error('Save failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Model.findById() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function findByIdNoCatch(id: string) {
  // SHOULD_FIRE: cast-error-no-try-catch-invalid-id — findById() throws CastError on invalid ObjectId. No try-catch.
  const user = await User.findById(id);
  return user;
}

export async function findByIdWithCatch(id: string) {
  try {
    // SHOULD_NOT_FIRE: User.findById() inside try-catch satisfies error handling
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.error('FindById failed:', err);
    throw err;
  }
}
