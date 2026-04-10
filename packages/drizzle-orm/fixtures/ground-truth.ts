/**
 * drizzle-orm Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "drizzle-orm"):
 *   - db.select()       postcondition: select-query-error
 *   - db.insert()       postcondition: insert-constraint-violation
 *   - db.update()       postcondition: update-constraint-violation
 *   - db.transaction()  postconditions: transaction-rollback-error, transaction-db-error-no-try-catch
 *   - db.execute()      postconditions: execute-query-error
 *
 * Detection path: drizzle() factory imported → db instance tracked →
 *   ThrowingFunctionDetector fires builder-chain .select()/.insert()/.update() →
 *   ContractMatcher checks try-catch → postconditions fire
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  email: varchar('email', { length: 256 }),
});

const db = drizzle(process.env.DATABASE_URL!);

// ─────────────────────────────────────────────────────────────────────────────
// 1. db.select() — reads
// ─────────────────────────────────────────────────────────────────────────────

export async function selectNoCatch() {
  // SHOULD_FIRE: select-query-error — SELECT throws on connection loss or table not found. No try-catch.
  const users = await db.select().from(usersTable);
  return users;
}

export async function selectWithCatch() {
  try {
    // SHOULD_NOT_FIRE: select inside try-catch satisfies error handling
    const users = await db.select().from(usersTable);
    return users;
  } catch (err) {
    console.error('Query failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. db.insert() — writes
// ─────────────────────────────────────────────────────────────────────────────

export async function insertNoCatch(name: string, email: string) {
  // SHOULD_FIRE: insert-constraint-violation — INSERT throws on unique constraint, FK violation. No try-catch.
  await db.insert(usersTable).values({ name, email });
}

export async function insertWithCatch(name: string, email: string) {
  try {
    // SHOULD_NOT_FIRE: insert inside try-catch
    await db.insert(usersTable).values({ name, email });
  } catch (err) {
    console.error('Insert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. db.update() — updates
// ─────────────────────────────────────────────────────────────────────────────

export async function updateNoCatch(id: number, name: string) {
  // SHOULD_FIRE: update-constraint-violation — UPDATE throws on constraint violations. No try-catch.
  await db.update(usersTable).set({ name }).where(eq(usersTable.id, id));
}

export async function updateWithCatch(id: number, name: string) {
  try {
    // SHOULD_NOT_FIRE: update inside try-catch
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, id));
  } catch (err) {
    console.error('Update failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. db.transaction() — atomic multi-operation blocks
// ─────────────────────────────────────────────────────────────────────────────

export async function transactionNoCatch(name: string, email: string) {
  // SHOULD_FIRE: transaction-rollback-error — transaction() without try-catch, any error inside propagates unhandled.
  await db.transaction(async (tx) => {
    await tx.insert(usersTable).values({ name, email });
    await tx.insert(usersTable).values({ name: name + '_copy', email: email + '_copy' });
  });
}

export async function transactionWithCatch(name: string, email: string) {
  try {
    // SHOULD_NOT_FIRE: transaction wrapped in try-catch — all errors handled
    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({ name, email });
      await tx.insert(usersTable).values({ name: name + '_copy', email: email + '_copy' });
    });
  } catch (err) {
    console.error('Transaction failed:', err);
    throw err;
  }
}

export async function transactionRollbackNotDistinguished(name: string, email: string) {
  // SHOULD_NOT_FIRE: has a catch block — scanner doesn't inspect catch content for TransactionRollbackError distinction
  // (transaction-rollback-error detection requires semantic analysis of catch block contents — not yet implemented)
  try {
    await db.transaction(async (tx) => {
      const result = await tx.select().from(usersTable);
      if (result.length === 0) {
        tx.rollback(); // intentional: no users in table
      }
      await tx.insert(usersTable).values({ name, email });
    });
  } catch (err) {
    // BUG: catches all errors including TransactionRollbackError — no distinction made
    console.error('Transaction error:', err);
  }
}

export async function transactionRollbackDistinguished(name: string, email: string) {
  try {
    // SHOULD_NOT_FIRE: catches TransactionRollbackError separately from DB errors
    await db.transaction(async (tx) => {
      const result = await tx.select().from(usersTable);
      if (result.length === 0) {
        tx.rollback();
      }
      await tx.insert(usersTable).values({ name, email });
    });
  } catch (err: any) {
    if (err?.constructor?.name === 'TransactionRollbackError') {
      // intentional rollback — handle gracefully
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. db.execute() — raw SQL queries
// ─────────────────────────────────────────────────────────────────────────────

export async function executeNoCatch() {
  const { sql } = await import('drizzle-orm');
  // SHOULD_FIRE: execute-query-error — db.execute() called without try-catch. Raw SQL can fail with syntax errors, missing tables.
  const result = await db.execute(sql`SELECT * FROM users WHERE id = ${1}`);
  return result;
}

export async function executeWithCatch() {
  try {
    // SHOULD_NOT_FIRE: execute inside try-catch — errors handled
    const { sql } = await import('drizzle-orm');
    const result = await db.execute(sql`SELECT * FROM users WHERE id = ${1}`);
    return result;
  } catch (err) {
    console.error('Raw query failed:', err);
    throw err;
  }
}
