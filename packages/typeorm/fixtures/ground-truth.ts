/**
 * typeorm Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "typeorm"):
 *   - repository.find()              postcondition: find-query-error
 *   - repository.save()              postcondition: save-constraint-violation
 *   - dataSource.transaction()       postcondition: transaction-error
 *   - repository.findOne()           postcondition: findone-query-failed-error
 *   - repository.findOneBy()         postcondition: findoneby-query-failed-error
 *   - repository.findOneOrFail()     postconditions: findone-or-fail-entity-not-found, findone-or-fail-query-failed
 *   - repository.findOneByOrFail()   postcondition: findonebyorfail-entity-not-found
 *   - repository.insert()            postconditions: insert-duplicate-key-error, insert-foreign-key-violation
 *   - repository.update()            postconditions: update-constraint-violation, update-silent-no-op
 *   - repository.delete()            postconditions: delete-foreign-key-constraint, delete-silent-no-op
 *   - repository.upsert()            postcondition: upsert-constraint-violation
 *   - repository.query()             postconditions: query-sql-syntax-error, query-sql-injection-risk
 *   - repository.softDelete()        postconditions: softdelete-missing-delete-date-column, softdelete-silent-no-op
 *   - repository.restore()           postcondition: restore-missing-delete-date-column
 *   - repository.remove()            postcondition: remove-foreign-key-constraint
 *   - repository.count()             postcondition: count-query-failed-error
 *   - repository.findBy()            postcondition: findby-query-failed-error
 *   - repository.findAndCount()      postcondition: findandcount-query-failed-error
 *   - repository.increment()         postcondition: increment-type-mismatch
 *   - repository.decrement()         postcondition: decrement-type-mismatch
 *   - dataSource.initialize()        postconditions: initialize-already-connected, initialize-connection-failure
 *   - dataSource.destroy()           postcondition: destroy-not-initialized
 *
 * Detection path: DataSource/Repository instances tracked →
 *   ThrowingFunctionDetector fires method calls →
 *   ContractMatcher checks try-catch → postconditions fire
 */

import { DataSource, Repository } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'testdb',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. repository.find() — reads
// ─────────────────────────────────────────────────────────────────────────────

export async function findNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: find-query-error — find throws on connection loss or query error. No try-catch.
  const users = await repo.find();
  return users;
}

export async function findWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: find inside try-catch satisfies error handling
    const users = await repo.find();
    return users;
  } catch (err) {
    console.error('Find failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. repository.save() — writes
// ─────────────────────────────────────────────────────────────────────────────

export async function saveNoCatch(repo: Repository<any>, data: object) {
  // SHOULD_FIRE: save-constraint-violation — save throws on unique constraint, FK violation. No try-catch.
  const result = await repo.save(data);
  return result;
}

export async function saveWithCatch(repo: Repository<any>, data: object) {
  try {
    // SHOULD_NOT_FIRE: save inside try-catch
    const result = await repo.save(data);
    return result;
  } catch (err) {
    console.error('Save failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. dataSource.transaction() — atomic operations
// ─────────────────────────────────────────────────────────────────────────────

export async function transactionNoCatch() {
  // SHOULD_FIRE: transaction-error — transaction throws on deadlock or constraint violation. No try-catch.
  await dataSource.transaction(async (manager) => {
    await manager.save({ id: 1, name: 'Test' });
  });
}

export async function transactionWithCatch() {
  try {
    // SHOULD_NOT_FIRE: transaction inside try-catch
    await dataSource.transaction(async (manager) => {
      await manager.save({ id: 1, name: 'Test' });
    });
  } catch (err) {
    console.error('Transaction failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. repository.findOne() — returns null if not found
// ─────────────────────────────────────────────────────────────────────────────

export async function findOneNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: findone-query-failed-error — throws on DB connection failure. No try-catch.
  const user = await repo.findOne({ where: { id: 1 } });
  return user;
}

export async function findOneWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: findOne inside try-catch satisfies error handling
    const user = await repo.findOne({ where: { id: 1 } });
    return user;
  } catch (err) {
    console.error('findOne failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. repository.findOneBy() — shorthand find by WHERE conditions
// ─────────────────────────────────────────────────────────────────────────────

export async function findOneByNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: findoneby-query-failed-error — throws on connection failure. No try-catch.
  const user = await repo.findOneBy({ id: 1 });
  return user;
}

export async function findOneByWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: findOneBy inside try-catch
    const user = await repo.findOneBy({ id: 1 });
    return user;
  } catch (err) {
    console.error('findOneBy failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. repository.findOneOrFail() — THROWS EntityNotFoundError if not found
// ─────────────────────────────────────────────────────────────────────────────

export async function findOneOrFailNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: findone-or-fail-entity-not-found — ALWAYS throws when not found. No try-catch.
  const user = await repo.findOneOrFail({ where: { id: 999 } });
  return user;
}

export async function findOneOrFailWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: findOneOrFail inside try-catch
    const user = await repo.findOneOrFail({ where: { id: 999 } });
    return user;
  } catch (err) {
    console.error('findOneOrFail threw:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. repository.findOneByOrFail() — THROWS EntityNotFoundError if not found
// ─────────────────────────────────────────────────────────────────────────────

export async function findOneByOrFailNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: findonebyorfail-entity-not-found — throws when not found. No try-catch.
  const user = await repo.findOneByOrFail({ id: 999 });
  return user;
}

export async function findOneByOrFailWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: findOneByOrFail inside try-catch
    const user = await repo.findOneByOrFail({ id: 999 });
    return user;
  } catch (err) {
    console.error('findOneByOrFail threw:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. repository.insert() — fast raw INSERT, no cascades
// ─────────────────────────────────────────────────────────────────────────────

export async function insertNoCatch(repo: Repository<any>, data: object) {
  // SHOULD_FIRE: insert-duplicate-key-error — throws on duplicate PK/unique constraint. No try-catch.
  const result = await repo.insert(data);
  return result;
}

export async function insertWithCatch(repo: Repository<any>, data: object) {
  try {
    // SHOULD_NOT_FIRE: insert inside try-catch
    const result = await repo.insert(data);
    return result;
  } catch (err) {
    console.error('Insert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. repository.update() — fast raw UPDATE, check UpdateResult.affected
// ─────────────────────────────────────────────────────────────────────────────

export async function updateNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: update-constraint-violation — throws on constraint violation. No try-catch.
  const result = await repo.update({ id: 1 }, { name: 'Updated' });
  return result;
}

export async function updateWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: update inside try-catch
    const result = await repo.update({ id: 1 }, { name: 'Updated' });
    return result;
  } catch (err) {
    console.error('Update failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. repository.delete() — fast raw DELETE, FK constraints may throw
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: delete-foreign-key-constraint — throws on FK constraint. No try-catch.
  const result = await repo.delete({ id: 1 });
  return result;
}

export async function deleteWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: delete inside try-catch
    const result = await repo.delete({ id: 1 });
    return result;
  } catch (err) {
    console.error('Delete failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. repository.upsert() — insert or update on conflict
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertNoCatch(repo: Repository<any>, data: object) {
  // SHOULD_FIRE: upsert-constraint-violation — throws on non-conflict constraint violations. No try-catch.
  const result = await repo.upsert(data, ['email']);
  return result;
}

export async function upsertWithCatch(repo: Repository<any>, data: object) {
  try {
    // SHOULD_NOT_FIRE: upsert inside try-catch
    const result = await repo.upsert(data, ['email']);
    return result;
  } catch (err) {
    console.error('Upsert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. repository.query() — raw SQL execution (SQL injection risk)
// ─────────────────────────────────────────────────────────────────────────────

export async function queryNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: query-sql-syntax-error — throws on SQL error. No try-catch.
  const results = await repo.query('SELECT * FROM users WHERE active = true');
  return results;
}

export async function queryWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: query inside try-catch with parameterized query
    const results = await repo.query('SELECT * FROM users WHERE id = $1', [1]);
    return results;
  } catch (err) {
    console.error('Query failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. repository.softDelete() — set deletedAt, requires @DeleteDateColumn
// ─────────────────────────────────────────────────────────────────────────────

export async function softDeleteNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: softdelete-missing-delete-date-column — throws if entity lacks @DeleteDateColumn. No try-catch.
  const result = await repo.softDelete({ id: 1 });
  return result;
}

export async function softDeleteWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: softDelete inside try-catch
    const result = await repo.softDelete({ id: 1 });
    return result;
  } catch (err) {
    console.error('softDelete failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. repository.restore() — restore soft-deleted entities
// ─────────────────────────────────────────────────────────────────────────────

export async function restoreNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: restore-missing-delete-date-column — throws if entity lacks @DeleteDateColumn. No try-catch.
  const result = await repo.restore({ id: 1 });
  return result;
}

export async function restoreWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: restore inside try-catch
    const result = await repo.restore({ id: 1 });
    return result;
  } catch (err) {
    console.error('restore failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. repository.remove() — remove entity with cascade support
// ─────────────────────────────────────────────────────────────────────────────

export async function removeNoCatch(repo: Repository<any>, entity: any) {
  // SHOULD_FIRE: remove-foreign-key-constraint — throws on FK constraint violation. No try-catch.
  const result = await repo.remove(entity);
  return result;
}

export async function removeWithCatch(repo: Repository<any>, entity: any) {
  try {
    // SHOULD_NOT_FIRE: remove inside try-catch
    const result = await repo.remove(entity);
    return result;
  } catch (err) {
    console.error('remove failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. repository.count() — count matching entities
// ─────────────────────────────────────────────────────────────────────────────

export async function countNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: count-query-failed-error — throws on connection failure. No try-catch.
  const total = await repo.count({ where: { active: true } });
  return total;
}

export async function countWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: count inside try-catch
    const total = await repo.count({ where: { active: true } });
    return total;
  } catch (err) {
    console.error('count failed:', err);
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. repository.findBy() — find by WHERE conditions
// ─────────────────────────────────────────────────────────────────────────────

export async function findByNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: findby-query-failed-error — throws on connection failure. No try-catch.
  const users = await repo.findBy({ active: true });
  return users;
}

export async function findByWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: findBy inside try-catch
    const users = await repo.findBy({ active: true });
    return users;
  } catch (err) {
    console.error('findBy failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. repository.findAndCount() — pagination pattern
// ─────────────────────────────────────────────────────────────────────────────

export async function findAndCountNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: findandcount-query-failed-error — throws on connection failure. No try-catch.
  const [users, total] = await repo.findAndCount({ take: 10, skip: 0 });
  return { users, total };
}

export async function findAndCountWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: findAndCount inside try-catch
    const [users, total] = await repo.findAndCount({ take: 10, skip: 0 });
    return { users, total };
  } catch (err) {
    console.error('findAndCount failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. repository.increment() — atomic increment
// ─────────────────────────────────────────────────────────────────────────────

export async function incrementNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: increment-type-mismatch — throws if column is not numeric. No try-catch.
  const result = await repo.increment({ id: 1 }, 'viewCount', 1);
  return result;
}

export async function incrementWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: increment inside try-catch
    const result = await repo.increment({ id: 1 }, 'viewCount', 1);
    return result;
  } catch (err) {
    console.error('increment failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. repository.decrement() — atomic decrement
// ─────────────────────────────────────────────────────────────────────────────

export async function decrementNoCatch(repo: Repository<any>) {
  // SHOULD_FIRE: decrement-type-mismatch — throws if column non-numeric or check constraint. No try-catch.
  const result = await repo.decrement({ id: 1 }, 'credits', 5);
  return result;
}

export async function decrementWithCatch(repo: Repository<any>) {
  try {
    // SHOULD_NOT_FIRE: decrement inside try-catch
    const result = await repo.decrement({ id: 1 }, 'credits', 5);
    return result;
  } catch (err) {
    console.error('decrement failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. dataSource.initialize() — connect to DB at startup
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeNoCatch() {
  // SHOULD_FIRE: initialize-already-connected — throws on DB connection failure or already-connected error. No try-catch.
  await dataSource.initialize();
}

export async function initializeWithCatch() {
  try {
    // SHOULD_NOT_FIRE: initialize inside try-catch
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
  } catch (err) {
    console.error('DataSource initialize failed:', err);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. dataSource.destroy() — close DB connections on shutdown
// ─────────────────────────────────────────────────────────────────────────────

export async function destroyNoCatch() {
  // SHOULD_FIRE: destroy-not-initialized — throws if not initialized. No try-catch.
  await dataSource.destroy();
}

export async function destroyWithCatch() {
  try {
    // SHOULD_NOT_FIRE: destroy inside try-catch with isInitialized guard
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  } catch (err) {
    console.error('DataSource destroy failed:', err);
  }
}
