/**
 * @libsql/client Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @libsql/client contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - db.execute() without try-catch → SHOULD_FIRE: database-error
 *   - db.batch() without try-catch → SHOULD_FIRE: database-error
 *   - db.execute() inside try-catch → SHOULD_NOT_FIRE
 *   - db.batch() inside try-catch → SHOULD_NOT_FIRE
 *   - createClient() itself → SHOULD_NOT_FIRE (synchronous factory, does not throw)
 *
 * Contracted postconditions:
 *   database-error: execute() or batch() throws LibsqlError on any failure
 *
 * Coverage:
 *   - Section 1: bare execute() → SHOULD_FIRE
 *   - Section 2: execute() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare batch() → SHOULD_FIRE
 *   - Section 4: batch() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 5: createClient() → SHOULD_NOT_FIRE (factory, not contracted)
 */

import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare execute() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function insertTodoNoCatch(description: string) {
  // SHOULD_FIRE: database-error — execute() without try-catch throws LibsqlError on failure
  await db.execute({
    sql: "INSERT INTO todos (description) VALUES (?)",
    args: [description],
  });
}

export async function selectRowsNoCatch() {
  // SHOULD_FIRE: database-error — execute() without try-catch, network/auth failure unhandled
  const { rows } = await db.execute("SELECT * FROM todos");
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. execute() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function insertTodoWithCatch(description: string) {
  try {
    // SHOULD_NOT_FIRE: execute() inside try-catch satisfies the database-error requirement
    await db.execute({
      sql: "INSERT INTO todos (description) VALUES (?)",
      args: [description],
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export async function selectRowsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: execute() wrapped in try-catch
    const { rows } = await db.execute("SELECT * FROM todos");
    return rows;
  } catch (error) {
    console.error("Query failed:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bare batch() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchInsertNoCatch(items: string[]) {
  // SHOULD_FIRE: database-error — batch() without try-catch, entire batch fails atomically
  await db.batch(
    items.map((item) => ({
      sql: "INSERT INTO items (name) VALUES (?)",
      args: [item],
    })),
    "write",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. batch() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchInsertWithCatch(items: string[]) {
  try {
    // SHOULD_NOT_FIRE: batch() inside try-catch satisfies the database-error requirement
    await db.batch(
      items.map((item) => ({
        sql: "INSERT INTO items (name) VALUES (?)",
        args: [item],
      })),
      "write",
    );
  } catch (error) {
    console.error("Batch failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. createClient() — synchronous factory, not contracted
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: createClient() is a synchronous factory function, not contracted
const anotherDb = createClient({
  url: "libsql://my-db.turso.io",
  authToken: "token",
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. transaction() — missing finally block → SHOULD_FIRE: transaction-not-closed
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Scanner rule for transaction-not-closed exists but currently detects
// ALL transaction() calls regardless of finally block (FP on clean case).
// KNOWN_FP: line below fires transaction-not-closed on clean cases pending scanner upgrade.
// See concern queued in upgrade-concerns.json: concern-20260417-libsql-client-deepen-1

export async function transferFundsNoFinally(fromId: number, toId: number, amount: number) {
  // SHOULD_FIRE: transaction-not-closed — tx.close() not called in finally block
  const tx = await db.transaction("write");
  await tx.execute({ sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?", args: [amount, fromId] });
  await tx.execute({ sql: "UPDATE accounts SET balance = balance + ? WHERE id = ?", args: [amount, toId] });
  await tx.commit();
  // Missing: tx.close() in finally block
}

export async function transferFundsWithFinally(fromId: number, toId: number, amount: number) {
  // SHOULD_NOT_FIRE: transaction closed in finally block
  // KNOWN_FP: scanner currently fires transaction-not-closed here — pending scanner upgrade
  // to detect finally-block tx.close() patterns (concern-20260417-libsql-client-deepen-1)
  const tx = await db.transaction("write");
  try {
    await tx.execute({ sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?", args: [amount, fromId] });
    await tx.execute({ sql: "UPDATE accounts SET balance = balance + ? WHERE id = ?", args: [amount, toId] });
    await tx.commit();
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  } finally {
    tx.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. migrate() — no try-catch → SHOULD_FIRE: migrate-no-try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function runMigrationsNoCatch() {
  // SHOULD_FIRE: migrate-no-try-catch — throws LibsqlError on SQL failure; crashes startup
  await db.migrate([
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)",
    "CREATE INDEX IF NOT EXISTS users_email ON users (email)",
  ]);
}

export async function runMigrationsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: migrate() wrapped in try-catch
    await db.migrate([
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)",
      "CREATE INDEX IF NOT EXISTS users_email ON users (email)",
    ]);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. executeMultiple() — no try-catch → SHOULD_FIRE: execute-multiple-no-try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function runSqlScriptNoCatch(sqlScript: string) {
  // SHOULD_FIRE: execute-multiple-no-try-catch — partial execution risk, no try-catch
  await db.executeMultiple(sqlScript);
}

export async function runSqlScriptWithCatch(sqlScript: string) {
  try {
    // SHOULD_NOT_FIRE: executeMultiple() inside try-catch
    await db.executeMultiple(sqlScript);
  } catch (error) {
    console.error("SQL script failed (partial execution may have occurred):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. transaction.commit() — new postcondition without scanner rule yet
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: commit-no-try-catch postcondition added in depth pass 2026-04-17.
// Scanner detection rule not yet implemented (concern-20260417-libsql-client-deepen-2).
// Fixture is here for future test coverage once detection is implemented.

export async function commitNoCatch(fromId: number, toId: number, amount: number) {
  // Future SHOULD_FIRE: commit-no-try-catch (pending scanner rule)
  const tx = await db.transaction("write");
  try {
    await tx.execute({ sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?", args: [amount, fromId] });
    await tx.commit(); // missing try-catch on commit specifically
  } finally {
    tx.close();
  }
}

export async function commitWithCatch(fromId: number, toId: number, amount: number) {
  // Future SHOULD_NOT_FIRE: commit-no-try-catch (pending scanner rule)
  const tx = await db.transaction("write");
  try {
    await tx.execute({ sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?", args: [amount, fromId] });
    await tx.commit();
  } catch (error) {
    console.error("Commit failed — data not persisted:", error);
    throw error;
  } finally {
    tx.close();
  }
}
