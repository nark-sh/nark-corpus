/**
 * sqlite3 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions with ACTIVE detection (V2 scanner):
 *   - db.prepare()  postcondition: syntax-error
 *
 * Contracted functions PENDING detection rules (callback-based, no await):
 *   - db.each()          postconditions: each-completion-error-ignored, each-syntax-error
 *   - db.close()         postconditions: close-unfinalised-statements, close-already-closed
 *   - db.loadExtension() postconditions: loadextension-file-not-found, loadextension-security-disabled
 *   - db.backup()        postconditions: backup-cantopen-destination, backup-misuse-after-finish
 *   See scanner concerns: concern-20260417-sqlite3-deepen-1 through -4
 *
 *   Added 2026-06-12 (deepen pass 2):
 *   - stmt.finalize()    postconditions: finalize-not-called, finalize-callback-error-ignored
 *   - stmt.run()         postconditions: statement-run-callback-error-ignored,
 *                                        statement-run-without-finalize-in-loop
 *   - db.map()           postconditions: map-callback-error-ignored,
 *                                        map-key-collision-silent-overwrite
 *   See scanner concerns: concern-20260612-sqlite3-deepen-1 through -4
 *
 * Detection path (prepare): new sqlite3.Database() → InstanceTracker tracks instance →
 *   ThrowingFunctionDetector fires prepare() → ContractMatcher checks try-catch →
 *   postcondition fires
 */

import sqlite3 from 'sqlite3';

// ─────────────────────────────────────────────────────────────────────────────
// 1. db.prepare() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function prepareNoCatch() {
  const db = new sqlite3.Database(':memory:');
  // SHOULD_FIRE: syntax-error — db.prepare() throws on SQL syntax errors. No try-catch.
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.finalize();
  db.close();
}

export async function prepareWithCatch() {
  const db = new sqlite3.Database(':memory:');
  try {
    // SHOULD_NOT_FIRE: db.prepare() inside try-catch satisfies error handling
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.finalize();
  } catch (err) {
    console.error('Prepare failed:', err);
    throw err;
  } finally {
    db.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. db.prepare() — second pattern (INSERT)
// ─────────────────────────────────────────────────────────────────────────────

export async function prepareInsertNoCatch() {
  const db = new sqlite3.Database(':memory:');
  // SHOULD_FIRE: syntax-error — db.prepare() throws on bad SQL. No try-catch.
  const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
  stmt.finalize();
  db.close();
}

export async function prepareInsertWithCatch() {
  const db = new sqlite3.Database(':memory:');
  try {
    // SHOULD_NOT_FIRE: db.prepare() inside try-catch satisfies error handling
    const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    stmt.finalize();
  } catch (err) {
    console.error('Prepare failed:', err);
    throw err;
  } finally {
    db.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3–6. db.each() / db.close() / db.loadExtension() / db.backup()
//
// Note: sqlite3 uses a callback-based API, not async/await. The V2 scanner
// analyzes await patterns and try-catch blocks. These new postconditions
// (each-completion-error-ignored, close-unfinalised-statements,
// loadextension-file-not-found, backup-cantopen-destination) require
// callback-error-check detection rules that do not yet exist in the scanner.
//
// Scanner upgrade concerns queued:
//   concern-20260417-sqlite3-deepen-1 (each completion callback)
//   concern-20260417-sqlite3-deepen-2 (close unfinalised)
//   concern-20260417-sqlite3-deepen-3 (loadExtension callback)
//   concern-20260417-sqlite3-deepen-4 (backup callback)
//
// Until those rules are implemented, these examples serve as documentation
// of the intended detection patterns.
// ─────────────────────────────────────────────────────────────────────────────

// Example: db.each() without completion callback
// Pattern to detect: db.each() with only ONE callback arg (no completion callback)
// Postcondition: each-completion-error-ignored
export function eachNoCompletionCallback(db: sqlite3.Database) {
  // Missing completion callback — any SQL error is silently swallowed
  db.each('SELECT * FROM users', (err: Error | null, row: unknown) => {
    if (err) throw err;
    console.log(row);
  });
}

// Pattern to detect: db.each() with TWO callbacks, both checking err
// This is the correct pattern and should NOT be flagged
export function eachWithCompletionCallback(db: sqlite3.Database, done: (err?: Error) => void) {
  db.each(
    'SELECT * FROM users',
    (err: Error | null, row: unknown) => {
      if (err) return done(err);
      console.log(row);
    },
    (err: Error | null, count: number) => {
      if (err) return done(err);
      done();
    }
  );
}

// Example: db.close() without finalizing statements
// Pattern to detect: db.close() called in same scope as db.prepare() without stmt.finalize()
// Postcondition: close-unfinalised-statements
export function closeWithUnfinalisedStatement(db: sqlite3.Database) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  db.close(); // stmt still active — SQLITE_BUSY: unable to close due to unfinalised statements
}

// Correct pattern: finalize before close
export function closeAfterFinalise(db: sqlite3.Database, done: () => void) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.finalize(() => {
    db.close((err?: Error | null) => {
      if (err) throw err;
      done();
    });
  });
}

// Example: db.loadExtension() without error check
// Pattern to detect: loadExtension() callback that doesn't check err
// Postcondition: loadextension-file-not-found
export function loadExtensionNoErrorCheck(db: sqlite3.Database) {
  // err ignored — file not found error silently swallowed
  db.loadExtension('./my-extension', (err: Error | null) => {
    console.log('Extension loaded'); // err ignored!
  });
}

// Correct pattern: check err in callback
export function loadExtensionWithErrorCheck(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadExtension('./my-extension', (err: Error | null) => {
      if (err) return reject(new Error(`Extension load failed: ${err.message}`));
      resolve();
    });
  });
}

// Example: db.backup() without error check
// Pattern to detect: backup() callback that doesn't check err
// Postcondition: backup-cantopen-destination
export function backupNoErrorCheck(db: sqlite3.Database) {
  // err ignored — CANTOPEN error silently swallowed
  const backup = db.backup('/nonexistent/path/backup.db', (err: Error | null) => {
    console.log('Backup complete'); // err ignored!
  });
}

// Correct pattern: check err in backup callback
export function backupWithErrorCheck(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    const backup = db.backup('./backup.db', (err: Error | null) => {
      if (err) return reject(new Error(`Backup failed: ${err.message}`));
      resolve();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Statement.finalize() — deepen 2026-06-12
//
// Postconditions: finalize-not-called, finalize-callback-error-ignored
// Scanner concerns queued:
//   concern-20260612-sqlite3-deepen-1 (finalize-not-called detection)
//   concern-20260612-sqlite3-deepen-2 (finalize-callback-error-ignored detection)
// ─────────────────────────────────────────────────────────────────────────────

// Pattern to detect: db.prepare() result never finalized
// Postcondition: finalize-not-called (PENDING detection rule — see concern-20260612-sqlite3-deepen-1)
// Once the scanner rule lands, the comment below becomes // SHOULD_FIRE.
export function prepareWithoutFinalize(db: sqlite3.Database) {
  // Missing stmt.finalize() — leaks native statement, breaks db.close()
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.run(42);
  // PENDING_DETECTION (finalize-not-called): stmt goes out of scope unfinalized
}

// Correct pattern: finalize after use
export function prepareWithFinalize(db: sqlite3.Database) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.run(42);
  stmt.finalize(); // PENDING_NEGATIVE: finalize called — should not fire once rule lands
}

// Pattern to detect: finalize callback ignores err
// Postcondition: finalize-callback-error-ignored (PENDING — concern-20260612-sqlite3-deepen-2)
export function finalizeIgnoresError(db: sqlite3.Database) {
  const stmt = db.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
  stmt.run([1, 'alice']);
  stmt.finalize((err: Error) => {
    // PENDING_DETECTION (finalize-callback-error-ignored): err not checked
    console.log('Done');
  });
}

// Correct pattern: check err in finalize callback
export function finalizeChecksError(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
    stmt.run([1, 'alice']);
    stmt.finalize((err: Error) => {
      // PENDING_NEGATIVE: err checked — should not fire once rule lands
      if (err) return reject(err);
      resolve();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Statement.run() — deepen 2026-06-12
//
// Postconditions: statement-run-callback-error-ignored, statement-run-without-finalize-in-loop
// Scanner concern queued:
//   concern-20260612-sqlite3-deepen-3 (statement.run callback err detection)
// ─────────────────────────────────────────────────────────────────────────────

// Pattern to detect: stmt.run() callback ignores err — silent insert loss in batch
// Postcondition: statement-run-callback-error-ignored (PENDING — concern-20260612-sqlite3-deepen-3)
export function statementRunIgnoresError(db: sqlite3.Database, users: { id: number; name: string }[]) {
  const stmt = db.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
  for (const user of users) {
    stmt.run([user.id, user.name], function(err: Error | null) {
      // PENDING_DETECTION (statement-run-callback-error-ignored): failed inserts swallowed
      console.log('Inserted');
    });
  }
  stmt.finalize();
}

// Correct pattern: check err in stmt.run callback
export function statementRunChecksError(db: sqlite3.Database, users: { id: number; name: string }[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
    let pending = users.length;
    if (pending === 0) {
      stmt.finalize();
      return resolve();
    }
    for (const user of users) {
      stmt.run([user.id, user.name], function(err: Error | null) {
        if (err) {
          stmt.finalize();
          return reject(err);
        }
        if (--pending === 0) {
          stmt.finalize();
          resolve();
        }
      });
    }
  });
}

// Pattern to detect: prepared statement used in loop without finalize
// Postcondition: statement-run-without-finalize-in-loop (PENDING — concern-20260612-sqlite3-deepen-3)
export function preparedLoopNoFinalize(db: sqlite3.Database, ids: number[]) {
  const stmt = db.prepare('UPDATE users SET seen = 1 WHERE id = ?');
  for (const id of ids) {
    stmt.run(id);
  }
  // PENDING_DETECTION (statement-run-without-finalize-in-loop): stmt leaks
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Database.map() / Statement.map() — deepen 2026-06-12
//
// Postconditions: map-callback-error-ignored, map-key-collision-silent-overwrite
// Scanner concern queued:
//   concern-20260612-sqlite3-deepen-4 (db.map callback err detection)
// ─────────────────────────────────────────────────────────────────────────────

// Pattern to detect: db.map() callback ignores err — query failure looks like empty result
// Postcondition: map-callback-error-ignored (PENDING — concern-20260612-sqlite3-deepen-4)
export function mapIgnoresError(db: sqlite3.Database) {
  db.map('SELECT id, name FROM users', (err: Error | null, usersById: Record<number, string>) => {
    // PENDING_DETECTION (map-callback-error-ignored): SQL syntax error → empty {} silently
    Object.keys(usersById).forEach(id => console.log(usersById[Number(id)]));
  });
}

// Correct pattern: check err in db.map callback
export function mapChecksError(db: sqlite3.Database): Promise<Record<number, string>> {
  return new Promise((resolve, reject) => {
    db.map('SELECT id, name FROM users', (err: Error | null, usersById: Record<number, string>) => {
      // PENDING_NEGATIVE: err checked — should not fire once rule lands
      if (err) return reject(new Error(`Map query failed: ${err.message}`));
      resolve(usersById);
    });
  });
}

// Pattern to detect: db.map() on a query with potentially non-unique first column
// Postcondition: map-key-collision-silent-overwrite (PENDING — needs schema heuristic)
// Note: this is a static-analysis heuristic — flag db.map() on SQL that doesn't
// have a UNIQUE/PRIMARY KEY guarantee on the first column. Detection requires
// schema knowledge OR a permissive warning on every db.map() call site.
export function mapWithCollidingKeys(db: sqlite3.Database) {
  // user_id is NOT unique across events table — later events silently overwrite earlier
  db.map('SELECT user_id, action FROM events', (err: Error | null, actionsByUser: Record<number, string>) => {
    if (err) throw err;
    // PENDING_DETECTION (map-key-collision-silent-overwrite): first column not unique
    // Caller thinks "1 action per user" but events table may have many per user
    console.log(actionsByUser);
  });
}
