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

// ─────────────────────────────────────────────────────────────────────────────
// 3. Connection.bulkWrite() — client-level bulk write (pass 17, mongoose 8.x+)
// ─────────────────────────────────────────────────────────────────────────────

export async function connectionBulkWriteNoCatch(conn: mongoose.Connection) {
  // SCANNER_TODO: connection-bulkwrite-mongoose-bulkwrite-error-no-try-catch — postcondition added pass 17. Detection requires Connection-instance tracking (concern-20260623-mongoose-deepen-1).
  const result = await conn.bulkWrite([
    { namespace: 'test.users', insertOne: { document: { name: 'Alice' } } },
    { namespace: 'test.posts', insertOne: { document: { title: 'Hello' } } },
  ]);
  return result;
}

export async function connectionBulkWriteWithCatch(conn: mongoose.Connection) {
  try {
    // SHOULD_NOT_FIRE: conn.bulkWrite() inside try-catch satisfies error handling
    const result = await conn.bulkWrite([
      { namespace: 'test.users', insertOne: { document: { name: 'Alice' } } },
    ]);
    return result;
  } catch (err) {
    console.error('bulkWrite failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Connection.destroy() — force shutdown
// ─────────────────────────────────────────────────────────────────────────────

export async function destroyNoCatch(conn: mongoose.Connection) {
  // SCANNER_TODO: connection-destroy-pending-writes-discarded — postcondition added pass 17. Detection requires Connection-instance tracking (concern-20260623-mongoose-deepen-2).
  await conn.destroy(true);
}

export async function destroyWithCatch(conn: mongoose.Connection) {
  try {
    // SHOULD_NOT_FIRE: conn.destroy() inside try-catch satisfies error handling
    await conn.destroy(true);
  } catch (err) {
    console.error('destroy failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Connection.createCollections() — plural with continueOnError
// ─────────────────────────────────────────────────────────────────────────────

export async function createCollectionsNoCatch(conn: mongoose.Connection) {
  // SCANNER_TODO: createcollections-create-collections-error-no-try-catch — postcondition added pass 17. Detection requires Connection-instance tracking (concern-20260623-mongoose-deepen-3).
  const result = await conn.createCollections(true);
  return result;
}

export async function createCollectionsWithCatch(conn: mongoose.Connection) {
  try {
    // SHOULD_NOT_FIRE: createCollections() inside try-catch satisfies error handling
    const result = await conn.createCollections(true);
    return result;
  } catch (err) {
    console.error('createCollections failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Document.deleteOne() — instance method (silent zero-deletedCount hazard)
// ─────────────────────────────────────────────────────────────────────────────

export async function documentDeleteOneNoCatch(name: string) {
  const user = await User.findOne({ name });
  if (!user) return;
  // SCANNER_TODO: document-deleteone-middleware-error-no-try-catch — postcondition added pass 17. Scanner currently matches user.deleteOne() to Model.deleteOne contract (returns connection-error-no-try-catch instead); needs Document-vs-Model deleteOne discrimination (concern-20260623-mongoose-deepen-4).
  await user.deleteOne();
}

export async function documentDeleteOneWithCatch(name: string) {
  try {
    const user = await User.findOne({ name });
    if (!user) return;
    // SHOULD_NOT_FIRE: user.deleteOne() inside try-catch satisfies error handling
    const result = await user.deleteOne();
    if (result.deletedCount === 0) {
      console.warn('No documents deleted — possible race or stale ref');
    }
  } catch (err) {
    console.error('deleteOne failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Model.createSearchIndexes() — plural Atlas Search variant
// ─────────────────────────────────────────────────────────────────────────────

export async function createSearchIndexesNoCatch() {
  // SHOULD_FIRE: createsearchindexes-not-atlas-command-error-no-try-catch — throws on non-Atlas clusters
  const names = await User.createSearchIndexes();
  return names;
}

export async function createSearchIndexesWithCatch() {
  try {
    // SHOULD_NOT_FIRE: createSearchIndexes() inside try-catch satisfies error handling
    const names = await User.createSearchIndexes();
    return names;
  } catch (err) {
    console.error('createSearchIndexes failed (likely non-Atlas cluster):', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Query.cursor().eachAsync() — async iteration with continueOnError
// ─────────────────────────────────────────────────────────────────────────────

export async function eachAsyncNoCatch() {
  // SHOULD_FIRE: eachasync-multi-error-no-try-catch — rejects with EachAsyncMultiError aggregating per-doc errors
  await User.find().cursor().eachAsync(
    async (doc) => {
      // process doc — may throw per-doc errors
      doc.name = doc.name.toUpperCase();
      await doc.save();
    },
    { continueOnError: true }
  );
}

export async function eachAsyncWithCatch() {
  try {
    // SHOULD_NOT_FIRE: eachAsync() inside try-catch satisfies error handling
    await User.find().cursor().eachAsync(
      async (doc) => {
        doc.name = doc.name.toUpperCase();
        await doc.save();
      },
      { continueOnError: true }
    );
  } catch (err) {
    console.error('eachAsync had per-document failures:', err);
    throw err;
  }
}
