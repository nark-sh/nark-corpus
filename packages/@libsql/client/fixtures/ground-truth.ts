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
