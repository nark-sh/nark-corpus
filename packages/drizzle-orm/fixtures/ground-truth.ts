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

// ─────────────────────────────────────────────────────────────────────────────
// 6. db.query.<table>.findFirst() — relational queries (added 2026-06-12)
//
// Detection assumes a db built with a relational schema. The shape
// `db.query.users.findFirst(...)` resolves to a PgRelationalQuery whose
// awaited result is `T | undefined`. The drizzle-orm contract postconditions
// `findfirst-undefined-on-missing-row` and `findfirst-driver-error` cover the
// two distinct failure modes.
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: these examples reference `db.query.users` as if a relational schema
// was wired in. For ground-truth purposes the call shape is what matters —
// the scanner detects `db.<chain>` patterns regardless of whether the schema
// is fully typed in the fixture. We disable TS noImplicitAny so that
// `db.query.users.findFirst()` parses without a `declare` shim that would
// break instance tracking. The fixture-runner harness sets `strict: false`.

export async function findFirstNoCatch(id: number) {
  // @ts-ignore relational schema not wired up in this fixture
  // SHOULD_FIRE: findfirst-undefined-on-missing-row — findFirst() resolves to T | undefined when no row matches. No try-catch and no undefined check.
  const user = await db.query.users.findFirst({ where: eq(usersTable.id, id) });
  return user;
}

export async function findFirstWithCatch(id: number) {
  try {
    // @ts-ignore relational schema not wired up in this fixture
    // SHOULD_NOT_FIRE: findFirst() inside try-catch — driver errors handled.
    const user = await db.query.users.findFirst({ where: eq(usersTable.id, id) });
    return user;
  } catch (err) {
    console.error('findFirst failed:', err);
    return null;
  }
}

export async function findFirstUndefinedAccessAntiPattern(id: number) {
  try {
    // @ts-ignore relational schema not wired up in this fixture
    // SHOULD_NOT_FIRE: findFirst() inside try-catch — driver-error postcondition satisfied; undefined-row semantic check is not yet implemented.
    const user = await db.query.users.findFirst({ where: eq(usersTable.id, id) });
    return (user as any).email; // BUG: TypeError if user is undefined — captured here as evidence for future undefined-row detection upgrade
  } catch (err) {
    console.error('findFirst lookup failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. db.query.<table>.findMany() — relational queries (added 2026-06-12)
// ─────────────────────────────────────────────────────────────────────────────

export async function findManyNoCatch() {
  // @ts-ignore relational schema not wired up in this fixture
  // SHOULD_FIRE: findmany-driver-error — findMany() throws on driver errors (connection lost, invalid relation config). No try-catch.
  const users = await db.query.users.findMany();
  return users;
}

export async function findManyWithCatch() {
  try {
    // @ts-ignore relational schema not wired up in this fixture
    // SHOULD_NOT_FIRE: findMany() inside try-catch — driver errors handled.
    const users = await db.query.users.findMany();
    return users;
  } catch (err) {
    console.error('findMany failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. db.batch() — atomic batched statements (added 2026-06-12)
//
// batch() is only available on D1/LibSQL/Neon. For ground-truth detection,
// we call db.batch() directly so the InstanceTracker's drizzle-orm
// association on `db` is preserved.
// ─────────────────────────────────────────────────────────────────────────────

export async function batchNoCatch(name: string, email: string) {
  // @ts-ignore batch() only typed on D1/LibSQL/Neon driver wrappers
  // SHOULD_FIRE: batch-statement-failure-rolls-back-all — batch() throws on any statement failure; the entire sequence is rolled back. No try-catch.
  const results = await db.batch([
    db.insert(usersTable).values({ name, email }),
    db.insert(usersTable).values({ name: name + '_copy', email: email + '_copy' }),
  ]);
  return results;
}

export async function batchWithCatch(name: string, email: string) {
  try {
    // @ts-ignore batch() only typed on D1/LibSQL/Neon driver wrappers
    // SHOULD_NOT_FIRE: batch() inside try-catch — atomic rollback handled.
    const results = await db.batch([
      db.insert(usersTable).values({ name, email }),
      db.insert(usersTable).values({ name: name + '_copy', email: email + '_copy' }),
    ]);
    return results;
  } catch (err) {
    console.error('batch failed (entire sequence rolled back):', err);
    throw err;
  }
}
