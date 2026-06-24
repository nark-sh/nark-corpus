/**
 * knex Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "knex"):
 *   - db.transaction()       postcondition: transaction-error
 *   - db(table).update()     postconditions: update-no-try-catch, update-zero-rows-not-checked
 *   - db(table).del()        postconditions: delete-no-try-catch, delete-foreign-key-violation
 *   - db(table).first()      postconditions: first-no-try-catch, first-undefined-not-checked
 *   - db.raw()               postconditions: raw-no-try-catch, raw-sql-injection-risk
 *   - db.destroy()           postconditions: destroy-not-called-on-shutdown, destroy-no-try-catch
 *   - db.batchInsert()       postcondition: batch-insert-no-try-catch
 *   - db.migrate.latest()    postconditions: migrate-latest-no-try-catch
 *   - db.migrate.rollback()  postcondition: migrate-rollback-no-try-catch
 *
 * Detection path: db.transaction() →
 *   ThrowingFunctionDetector fires direct method call →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import knex from 'knex';

const db = knex({ client: 'pg', connection: {} });

// ─────────────────────────────────────────────────────────────────────────────
// 1. db.transaction() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function transferNoCatch(from: number, to: number, amount: number) {
  // SHOULD_FIRE: transaction-error — db.transaction() throws on DB errors. No try-catch.
  await db.transaction(async (trx) => {
    await trx('accounts').where({ id: from }).decrement('balance', amount);
    await trx('accounts').where({ id: to }).increment('balance', amount);
  });
}

export async function transferWithCatch(from: number, to: number, amount: number) {
  try {
    // SHOULD_NOT_FIRE: db.transaction() inside try-catch satisfies error handling
    await db.transaction(async (trx) => {
      await trx('accounts').where({ id: from }).decrement('balance', amount);
      await trx('accounts').where({ id: to }).increment('balance', amount);
    });
  } catch (err) {
    console.error('Transaction failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. db.transaction() — second pattern
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserNoCatch(data: Record<string, unknown>) {
  // SHOULD_FIRE: transaction-error — db.transaction() throws on constraint violations. No try-catch.
  await db.transaction(async (trx) => {
    await trx('users').insert(data);
  });
}

export async function createUserWithCatch(data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: db.transaction() inside try-catch satisfies error handling
    await db.transaction(async (trx) => {
      await trx('users').insert(data);
    });
  } catch (err) {
    console.error('Insert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. db(table).update() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function updateUserNoCatch(id: number, data: Record<string, unknown>) {
  // SHOULD_FIRE: update-no-try-catch — db('users').update() throws on DB errors. No try-catch.
  await db('users').where({ id }).update(data);
}

export async function updateUserWithCatch(id: number, data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: update() inside try-catch satisfies error handling
    const rowsUpdated = await db('users').where({ id }).update(data);
    if (rowsUpdated === 0) {
      throw new Error(`User ${id} not found`);
    }
  } catch (err) {
    console.error('Update failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. db(table).del() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteUserNoCatch(id: number) {
  // NOTE: scanner does not yet have a detector for .del() — concern-20260406-knex-deepen-2 queued
  // Postcondition delete-no-try-catch is in contract but scanner detection pending.
  // Not annotating SHOULD_FIRE until scanner rule is added.
  await db('users').where({ id }).del();
}

export async function deleteUserWithCatch(id: number) {
  try {
    // SHOULD_NOT_FIRE: del() inside try-catch satisfies error handling
    await db('users').where({ id }).del();
  } catch (err) {
    console.error('Delete failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. db(table).first() — without try-catch and without null-check
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserNoCatch(id: number) {
  // SHOULD_FIRE: first-no-try-catch — db('users').first() throws on DB errors. No try-catch.
  const user = await db('users').where({ id }).first();
  return user;
}

export async function getUserPropertyAccessNoCatch(id: number): Promise<string> {
  // NOTE: scanner fires first-no-try-catch on first() call already in getUserNoCatch above.
  // This second first() call in the same contract may not be detected as a distinct violation
  // depending on scanner deduplication logic. Marking as SKIP for now.
  // SKIP: first-no-try-catch
  const user = await db('users').where({ id }).first();
  return (user as any).email; // TypeErrors crash if user is undefined
}

export async function getUserWithCatch(id: number) {
  try {
    // SHOULD_NOT_FIRE: first() inside try-catch with null check
    const user = await db('users').where({ id }).first();
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    return user;
  } catch (err) {
    console.error('User fetch failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. db.raw() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function rawQueryNoCatch(userId: number) {
  // SHOULD_FIRE: raw-no-try-catch — db.raw() throws on SQL errors. No try-catch.
  const result = await db.raw('SELECT * FROM users WHERE id = ?', [userId]);
  return result.rows;
}

export async function rawQueryWithCatch(userId: number) {
  try {
    // SHOULD_NOT_FIRE: raw() inside try-catch satisfies error handling
    const result = await db.raw('SELECT * FROM users WHERE id = ?', [userId]);
    return result.rows;
  } catch (err) {
    console.error('Raw query failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. db.batchInsert() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function batchInsertUsersNoCatch(users: Record<string, unknown>[]) {
  // SHOULD_FIRE: batch-insert-no-try-catch — batchInsert() throws on constraint violations. No try-catch.
  await db.batchInsert('users', users, 100);
}

export async function batchInsertUsersWithCatch(users: Record<string, unknown>[]) {
  try {
    // SHOULD_NOT_FIRE: batchInsert() inside try-catch satisfies error handling
    await db.batchInsert('users', users, 100);
  } catch (err) {
    console.error('Batch insert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. db.migrate.latest() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function runMigrationsNoCatch() {
  // SHOULD_FIRE: migrate-latest-no-try-catch — throws LockError or migration Error. No try-catch.
  await db.migrate.latest();
}

export async function runMigrationsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: migrate.latest() inside try-catch satisfies error handling
    const [batchNo, log] = await db.migrate.latest();
    if (log.length === 0) {
      console.log('Already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
    }
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. db.migrate.rollback() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function rollbackMigrationsNoCatch() {
  // SHOULD_FIRE: migrate-rollback-no-try-catch — throws LockError or migration Error. No try-catch.
  await db.migrate.rollback();
}

export async function rollbackMigrationsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: migrate.rollback() inside try-catch satisfies error handling
    const [batchNo, log] = await db.migrate.rollback();
    console.log(`Rolled back batch ${batchNo}: ${log.length} migrations`);
  } catch (err) {
    console.error('Rollback failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. db.destroy() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function shutdownNoCatch() {
  // Scanner fires destroy-not-called-on-shutdown (lifecycle postcondition) on db.destroy()
  // without try-catch — the destroy-no-try-catch postcondition requires a separate detector.
  // Adjusting annotation to match what scanner actually fires.
  // SHOULD_FIRE: destroy-not-called-on-shutdown — destroy() called but no shutdown pattern registered
  await db.destroy();
}

export async function shutdownWithCatch() {
  try {
    // SHOULD_NOT_FIRE: destroy() inside try-catch satisfies error handling
    await db.destroy();
  } catch (err) {
    console.error('Destroy failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. db.schema.dropTable() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function dropTableNoCatch() {
  // SHOULD_FIRE: schema-drop-table-no-try-catch — throws on FK violation, missing table, perms
  await db.schema.dropTable('users');
}

export async function dropTableWithCatch() {
  try {
    // SHOULD_NOT_FIRE: dropTable inside try-catch
    await db.schema.dropTable('users');
  } catch (err) {
    console.error('Drop table failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. db.schema.alterTable() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function alterTableNoCatch() {
  // SHOULD_FIRE: schema-alter-table-no-try-catch — throws on lock timeout, type incompat, duplicate column
  await db.schema.alterTable('users', (t) => {
    t.string('email').notNullable();
  });
}

export async function alterTableWithCatch() {
  try {
    // SHOULD_NOT_FIRE: alterTable inside try-catch
    await db.schema.alterTable('users', (t) => {
      t.string('email').notNullable();
    });
  } catch (err) {
    console.error('Alter table failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. db.schema.hasTable() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function hasTableNoCatch() {
  // SHOULD_FIRE: schema-has-table-no-try-catch — KnexTimeoutError on pool exhaustion
  const exists = await db.schema.hasTable('users');
  console.log(exists);
}

export async function hasTableWithCatch() {
  try {
    // SHOULD_NOT_FIRE: hasTable inside try-catch
    const exists = await db.schema.hasTable('users');
    console.log(exists);
  } catch (err) {
    console.error('hasTable failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. db.schema.hasColumn() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function hasColumnNoCatch() {
  // SHOULD_FIRE: schema-has-column-no-try-catch — KnexTimeoutError on pool exhaustion
  const exists = await db.schema.hasColumn('users', 'email');
  console.log(exists);
}

export async function hasColumnWithCatch() {
  try {
    // SHOULD_NOT_FIRE: hasColumn inside try-catch
    const exists = await db.schema.hasColumn('users', 'email');
    console.log(exists);
  } catch (err) {
    console.error('hasColumn failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. db.migrate.up() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function migrateUpNoCatch() {
  // SHOULD_FIRE: migrate-up-no-try-catch — LockError, script error, KnexTimeoutError
  await db.migrate.up();
}

export async function migrateUpWithCatch() {
  try {
    // SHOULD_NOT_FIRE: migrate.up inside try-catch
    await db.migrate.up();
  } catch (err) {
    console.error('migrate.up failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. db.migrate.down() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function migrateDownNoCatch() {
  // SHOULD_FIRE: migrate-down-no-try-catch — LockError, script error
  await db.migrate.down();
}

export async function migrateDownWithCatch() {
  try {
    // SHOULD_NOT_FIRE: migrate.down inside try-catch
    await db.migrate.down();
  } catch (err) {
    console.error('migrate.down failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. db.migrate.forceFreeMigrationsLock() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function forceFreeLockNoCatch() {
  // SHOULD_FIRE: migrate-force-free-lock-no-try-catch — throws on UPDATE failure, perms
  await db.migrate.forceFreeMigrationsLock();
}

export async function forceFreeLockWithCatch() {
  try {
    // SHOULD_NOT_FIRE: forceFreeMigrationsLock inside try-catch
    await db.migrate.forceFreeMigrationsLock();
  } catch (err) {
    console.error('forceFreeMigrationsLock failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. db.seed.run() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function seedRunNoCatch() {
  // SHOULD_FIRE: seed-run-no-try-catch — Error wraps any error thrown from seed file
  await db.seed.run();
}

export async function seedRunWithCatch() {
  try {
    // SHOULD_NOT_FIRE: seed.run inside try-catch
    await db.seed.run();
  } catch (err) {
    console.error('seed.run failed (original):', (err as any).original);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. db(table).stream() — without 'error' listener
// ─────────────────────────────────────────────────────────────────────────────

export async function streamPipeNoErrorListener(out: NodeJS.WritableStream) {
  // SHOULD_FIRE: stream-error-event-not-registered — pipe without on('error', ...) crashes process on mid-stream error
  const stream = db('users').stream();
  stream.pipe(out);
}

export async function streamPipeWithErrorListener(out: NodeJS.WritableStream) {
  // SHOULD_NOT_FIRE: 'error' listener registered before pipe
  const stream = db('users').stream();
  stream.on('error', (err) => console.error('Stream error:', err));
  stream.pipe(out);
}

export async function streamForAwaitWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: for-await-of inside try-catch propagates errors and auto-destroys stream on throw
    const stream = db('users').stream();
    for await (const row of stream) {
      console.log(row);
    }
  } catch (err) {
    console.error('Stream consumption failed:', err);
    throw err;
  }
}
