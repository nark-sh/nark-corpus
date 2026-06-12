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

// ─────────────────────────────────────────────────────────────────────────────
// 10. execute() with large integer result — RangeError not LibsqlError
// Postcondition: execute-integer-range-error
// NOTE: Scanner detection rule not yet implemented (concern-20260417-libsql-client-deepen-7).
// This postcondition fires when result contains integers > 2^53-1 and intMode="number" (default).
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: execute-integer-range-error
// Future SHOULD_FIRE: execute() with no catch for RangeError when large integers in result
// (only LibsqlError caught — RangeError from result deserialization is missed)
export async function fetchLargeIdRowOnlyLibsqlCatch() {
  try {
    // SHOULD_FIRE: catches LibsqlError but NOT RangeError from integer deserialization
    const { rows } = await db.execute("SELECT id, value FROM large_table WHERE id > 9007199254740991");
    return rows;
  } catch (error) {
    if (error instanceof Error && error.constructor.name === "LibsqlError") {
      console.error("DB error:", error.message);
    }
    throw error;
    // RangeError from intMode="number" overflow is NOT caught — will propagate uncaught
  }
}

// @expect-clean
// SHOULD_NOT_FIRE: catches all errors including RangeError
export async function fetchLargeIdRowWithFullCatch() {
  try {
    const { rows } = await db.execute("SELECT id, value FROM large_table WHERE id > 9007199254740991");
    return rows;
  } catch (error) {
    // Catches both LibsqlError and RangeError
    if (error instanceof RangeError) {
      // Large integer detected — client should be reconfigured with intMode: "bigint"
      throw new Error("Database contains integers too large for JS number type; use intMode: 'bigint'");
    }
    console.error("DB error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. execute() with NaN/Infinity argument — RangeError at serialization time
// Postcondition: execute-invalid-number-arg
// NOTE: Scanner detection rule not yet implemented.
// This postcondition fires when args contains NaN or Infinity (from computation).
// RangeError thrown before network request — NOT a LibsqlError.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: execute-invalid-number-arg
// Future SHOULD_FIRE: execute() passes a computed number that may be NaN/Infinity
// Only LibsqlError is caught — RangeError from argument validation is missed
export async function insertMetricNanArg(value: number, divisor: number) {
  const ratio = value / divisor; // could be Infinity (divisor=0) or NaN (NaN input)
  try {
    // SHOULD_FIRE: no validation of ratio before use as arg; only LibsqlError caught
    await db.execute({
      sql: "INSERT INTO metrics (name, ratio) VALUES (?, ?)",
      args: ["my_metric", ratio],
    });
    // RangeError thrown synchronously if ratio is NaN or Infinity — not caught here
  } catch (error) {
    if (error instanceof Error && error.constructor.name === "LibsqlError") {
      console.error("DB error:", error.message);
    }
    throw error;
  }
}

// @expect-clean
// SHOULD_NOT_FIRE: validates ratio before using as arg, catching RangeError case
export async function insertMetricValidatedArg(value: number, divisor: number) {
  const ratio = value / divisor;
  if (!Number.isFinite(ratio)) {
    throw new Error(`Invalid ratio: ${ratio} — NaN or Infinity cannot be stored`);
  }
  try {
    // SHOULD_NOT_FIRE: ratio validated to be finite before use
    await db.execute({
      sql: "INSERT INTO metrics (name, ratio) VALUES (?, ?)",
      args: ["my_metric", ratio],
    });
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. execute() with oversized bigint argument — RangeError at serialization time
// Postcondition: execute-invalid-bigint-arg
// NOTE: Scanner detection rule not yet implemented.
// This postcondition fires when args contains bigint > 2^63-1 or < -(2^63).
// RangeError thrown before network request — NOT a LibsqlError.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: execute-invalid-bigint-arg
// Future SHOULD_FIRE: execute() passes a bigint that may exceed SQLite INTEGER range
// Only generic error caught — no RangeError handling for oversized bigint arg
export async function insertExternalIdNoCatch(externalId: bigint) {
  try {
    // SHOULD_FIRE: no range check on externalId bigint; only generic catch
    await db.execute({
      sql: "INSERT INTO items (external_id) VALUES (?)",
      args: [externalId],
    });
    // RangeError if externalId > 9223372036854775807n (2^63-1) — caught only by generic catch below
  } catch (error) {
    if (error instanceof Error && error.constructor.name === "LibsqlError") {
      console.error("DB error:", error.message);
    }
    throw error; // RangeError propagates unhandled to caller
  }
}

// @expect-clean
// SHOULD_NOT_FIRE: validates bigint is in SQLite INTEGER range before use
export async function insertExternalIdValidated(externalId: bigint) {
  const maxSqliteInt = 9223372036854775807n;
  const minSqliteInt = -9223372036854775808n;
  if (externalId > maxSqliteInt || externalId < minSqliteInt) {
    throw new Error(`External ID ${externalId} exceeds SQLite INTEGER range — store as TEXT`);
  }
  try {
    // SHOULD_NOT_FIRE: bigint validated before use
    await db.execute({
      sql: "INSERT INTO items (external_id) VALUES (?)",
      args: [externalId],
    });
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// sync() postconditions (added 2026-06-11 deepen pass)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: sync-wrong-client-type
// @expect-violation: sync-network-failure
// @expect-violation: sync-client-closed
export async function syncReplicaNoErrorHandling() {
  // SHOULD_FIRE: sync-wrong-client-type — no try-catch; throws LibsqlError(SYNC_NOT_SUPPORTED) on http clients
  await db.sync();
}

// SHOULD_NOT_FIRE: try-catch is present — scanner accepts any catch as satisfying the postcondition.
// Detecting swallowed-catch (no rethrow) is a future scanner capability not yet implemented.
export async function syncReplicaGenericCatch() {
  try {
    await db.sync();
  } catch (error) {
    // Generic catch — swallows SYNC_NOT_SUPPORTED without surfacing misconfiguration.
    // NOTE: This is a best-practice gap (no code check) but scanner treats try-catch as sufficient.
    console.error("Sync failed:", error);
  }
}

// @expect-clean
// SHOULD_NOT_FIRE: properly handles SYNC_NOT_SUPPORTED and network failures
export async function syncReplicaWithProperHandling() {
  try {
    const replicated = await db.sync();
    console.log(`Synced: ${replicated?.frames_synced} frames`);
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'SYNC_NOT_SUPPORTED') {
      // Not an embedded replica client — skip sync gracefully
      return;
    }
    if (error instanceof Error && (error as any).code === 'CLIENT_CLOSED') {
      console.error('Client closed before sync could complete');
      return;
    }
    // Network failure — log but don't crash (local reads still work)
    console.error('Sync failed — serving stale replica data:', error);
  }
}
