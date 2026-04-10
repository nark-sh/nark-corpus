/**
 * @planetscale/database Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @planetscale/database contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - conn.execute() without try-catch → SHOULD_FIRE: database-error
 *   - conn.transaction() without try-catch → SHOULD_FIRE: database-error
 *   - conn.execute() inside try-catch → SHOULD_NOT_FIRE
 *   - conn.transaction() inside try-catch → SHOULD_NOT_FIRE
 *   - connect() itself → SHOULD_NOT_FIRE (factory, synchronous-ish, returns Connection)
 *
 * Contracted postconditions:
 *   database-error: execute() or transaction() throws DatabaseError/TypeError on failure
 *
 * Coverage:
 *   - Section 1: bare execute() → SHOULD_FIRE
 *   - Section 2: execute() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare transaction() → SHOULD_FIRE
 *   - Section 4: transaction() inside try-catch → SHOULD_NOT_FIRE
 */

import { connect } from "@planetscale/database";

const conn = connect({
  host: process.env.DATABASE_HOST!,
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare execute() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function selectUsersNoCatch(userId: string) {
  // SHOULD_FIRE: database-error — execute() without try-catch, network failure unhandled
  const { rows } = await conn.execute("SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  return rows;
}

export async function insertOrderNoCatch(orderId: string, userId: string) {
  // SHOULD_FIRE: database-error — execute() without try-catch causes unhandled DatabaseError
  await conn.execute("INSERT INTO orders (id, user_id) VALUES (?, ?)", [
    orderId,
    userId,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. execute() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function selectUsersWithCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: execute() inside try-catch satisfies the database-error requirement
    const { rows } = await conn.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return rows;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  }
}

export async function insertOrderWithCatch(orderId: string, userId: string) {
  try {
    // SHOULD_NOT_FIRE: execute() wrapped in try-catch
    await conn.execute("INSERT INTO orders (id, user_id) VALUES (?, ?)", [
      orderId,
      userId,
    ]);
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bare transaction() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function transferFundsNoCatch(
  fromId: string,
  toId: string,
  amount: number,
) {
  // SHOULD_FIRE: database-error — transaction() without try-catch, error propagates to caller
  await conn.transaction(async (tx) => {
    await tx.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", [
      amount,
      fromId,
    ]);
    await tx.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", [
      amount,
      toId,
    ]);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. transaction() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function transferFundsWithCatch(
  fromId: string,
  toId: string,
  amount: number,
) {
  try {
    // SHOULD_NOT_FIRE: transaction() inside try-catch satisfies the database-error requirement
    await conn.transaction(async (tx) => {
      await tx.execute(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        [amount, fromId],
      );
      await tx.execute(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [amount, toId],
      );
    });
  } catch (error) {
    console.error("Transaction failed, rolled back:", error);
    throw error;
  }
}
