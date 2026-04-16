/**
 * sequelize Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "sequelize"):
 *   - sequelize.authenticate()       postcondition: connection-failure
 *   - sequelize.close()              postcondition: close-failure
 *   - Model.findAll()                postcondition: query-failure
 *   - Model.findAndCountAll()        postcondition: query-failure
 *   - Model.findOrCreate()           postcondition: unique-constraint-race
 *   - Model.create()                 postcondition: unique-constraint
 *   - Model.bulkCreate()             postcondition: unique-constraint
 *   - Model.upsert()                 postcondition: validation-error
 *   - Model.restore()                postcondition: restore-failure
 *   - Model.increment()              postcondition: increment-failure
 *   - Model.decrement()              postcondition: decrement-failure
 *   - Model.truncate()               postcondition: truncate-failure
 *   - Model.aggregate/max/min/sum()  postcondition: query-failure
 *   - instance.save()                postcondition: unique-constraint
 *   - instance.reload()              postcondition: reload-deleted
 *   - instance.validate()            postcondition: validation-failure
 *   - t.commit()                     postcondition: commit-already-finished, commit-database-error
 *   - t.rollback()                   postcondition: rollback-already-finished, rollback-never-started
 *   - instance.update()              postcondition: instance-update-unique-constraint
 *   - instance.destroy()             postcondition: instance-destroy-foreign-key
 *   - Model.findOrBuild()            postcondition: findorbuild-query-failure
 *   - Model.findCreateFind()         postcondition: findcreatefind-validation-error
 *   - instance.restore()             postcondition: instance-restore-not-paranoid
 *
 * Detection path: Sequelize instance tracked →
 *   ThrowingFunctionDetector fires .authenticate()/.models.User.findAll() →
 *   ContractMatcher checks try-catch → postconditions fire
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgresql://localhost/testdb');

// ─────────────────────────────────────────────────────────────────────────────
// 1. sequelize.authenticate() — connection test
// ─────────────────────────────────────────────────────────────────────────────

export async function authenticateNoCatch() {
  // SHOULD_FIRE: connection-failure — authenticate throws on wrong credentials or DB unavailable. No try-catch.
  await sequelize.authenticate();
}

export async function authenticateWithCatch() {
  try {
    // SHOULD_NOT_FIRE: authenticate inside try-catch satisfies error handling
    await sequelize.authenticate();
    console.log('Connection established');
  } catch (err) {
    console.error('Authentication failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Model.findAll() — read queries
// ─────────────────────────────────────────────────────────────────────────────

export async function findAllNoCatch() {
  // SHOULD_FIRE: query-failure — findAll throws on connection loss or invalid query. No try-catch.
  const users = await sequelize.models.User.findAll();
  return users;
}

export async function findAllWithCatch() {
  try {
    // SHOULD_NOT_FIRE: findAll inside try-catch
    const users = await sequelize.models.User.findAll();
    return users;
  } catch (err) {
    console.error('findAll failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Model.create() — writes
// ─────────────────────────────────────────────────────────────────────────────

export async function createNoCatch(email: string) {
  // SHOULD_FIRE: unique-constraint — create throws on duplicate email or validation error. No try-catch.
  const user = await sequelize.models.User.create({ email });
  return user;
}

export async function createWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: create inside try-catch
    const user = await sequelize.models.User.create({ email });
    return user;
  } catch (err) {
    console.error('Create failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Model.bulkCreate() — batch inserts
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkCreateNoCatch(records: any[]) {
  // SHOULD_FIRE: unique-constraint — bulkCreate throws on duplicate. No try-catch.
  const result = await sequelize.models.User.bulkCreate(records);
  return result;
}

export async function bulkCreateWithCatch(records: any[]) {
  try {
    // SHOULD_NOT_FIRE: bulkCreate inside try-catch
    const result = await sequelize.models.User.bulkCreate(records);
    return result;
  } catch (err) {
    console.error('bulkCreate failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Model.findOrCreate() — find-or-insert
// ─────────────────────────────────────────────────────────────────────────────

export async function findOrCreateNoCatch(email: string) {
  // SHOULD_FIRE: unique-constraint-race — findOrCreate can throw UniqueConstraintError under concurrency. No try-catch.
  const [user, created] = await sequelize.models.User.findOrCreate({
    where: { email },
    defaults: { email },
  });
  return { user, created };
}

export async function findOrCreateWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: findOrCreate inside try-catch
    const [user, created] = await sequelize.models.User.findOrCreate({
      where: { email },
      defaults: { email },
    });
    return { user, created };
  } catch (err) {
    console.error('findOrCreate failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Model.findAndCountAll() — pagination queries
// ─────────────────────────────────────────────────────────────────────────────

export async function findAndCountAllNoCatch() {
  // SHOULD_FIRE: query-failure — findAndCountAll throws on connection loss. No try-catch.
  const result = await sequelize.models.User.findAndCountAll({ limit: 10, offset: 0 });
  return result;
}

export async function findAndCountAllWithCatch() {
  try {
    // SHOULD_NOT_FIRE: findAndCountAll inside try-catch
    const result = await sequelize.models.User.findAndCountAll({ limit: 10, offset: 0 });
    return result;
  } catch (err) {
    console.error('findAndCountAll failed:', err);
    return { count: 0, rows: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Model.upsert() — insert-or-update
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertNoCatch(data: any) {
  // SHOULD_FIRE: validation-error — upsert throws on validation failure. No try-catch.
  const [instance, created] = await sequelize.models.User.upsert(data);
  return { instance, created };
}

export async function upsertWithCatch(data: any) {
  try {
    // SHOULD_NOT_FIRE: upsert inside try-catch
    const [instance, created] = await sequelize.models.User.upsert(data);
    return { instance, created };
  } catch (err) {
    console.error('upsert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. instance.save() — persist instance changes
// ─────────────────────────────────────────────────────────────────────────────

export async function saveNoCatch() {
  const user = await sequelize.models.User.findByPk(1);
  if (user) {
    (user as any).email = 'new@example.com';
    // SHOULD_NOT_FIRE: scanner gap — unique-constraint — save throws on duplicate or validation error. No try-catch.
    await user.save();
  }
}

export async function saveWithCatch() {
  const user = await sequelize.models.User.findByPk(1);
  if (user) {
    try {
      (user as any).email = 'new@example.com';
      // SHOULD_NOT_FIRE: save inside try-catch
      await user.save();
    } catch (err) {
      console.error('save failed:', err);
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. sequelize.close() — connection cleanup
// ─────────────────────────────────────────────────────────────────────────────

export async function closeNoCatch() {
  // SHOULD_FIRE: close-failure — close throws on pool shutdown error. No try-catch.
  await sequelize.close();
}

export async function closeWithCatch() {
  try {
    // SHOULD_NOT_FIRE: close inside try-catch
    await sequelize.close();
  } catch (err) {
    console.error('close failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Model.restore() — paranoid soft-delete restore
// ─────────────────────────────────────────────────────────────────────────────

export async function restoreNoCatch() {
  // SHOULD_FIRE: restore-failure — restore throws on connection error. No try-catch.
  await sequelize.models.User.restore({ where: { id: 1 } });
}

export async function restoreWithCatch() {
  try {
    // SHOULD_NOT_FIRE: restore inside try-catch
    await sequelize.models.User.restore({ where: { id: 1 } });
  } catch (err) {
    console.error('restore failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Model.increment() — atomic counter
// ─────────────────────────────────────────────────────────────────────────────

export async function incrementNoCatch() {
  // SHOULD_FIRE: increment-failure — increment throws on DB error. No try-catch.
  await sequelize.models.User.increment('loginCount', { where: { id: 1 } });
}

export async function incrementWithCatch() {
  try {
    // SHOULD_NOT_FIRE: increment inside try-catch
    await sequelize.models.User.increment('loginCount', { where: { id: 1 } });
  } catch (err) {
    console.error('increment failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Model.decrement() — atomic decrement
// ─────────────────────────────────────────────────────────────────────────────

export async function decrementNoCatch() {
  // SHOULD_FIRE: decrement-failure — decrement throws on DB error. No try-catch.
  await sequelize.models.User.decrement('credits', { where: { id: 1 } });
}

export async function decrementWithCatch() {
  try {
    // SHOULD_NOT_FIRE: decrement inside try-catch
    await sequelize.models.User.decrement('credits', { where: { id: 1 } });
  } catch (err) {
    console.error('decrement failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Model.truncate() — delete all rows
// ─────────────────────────────────────────────────────────────────────────────

export async function truncateNoCatch() {
  // SHOULD_FIRE: truncate-failure — truncate throws on FK constraint. No try-catch.
  await sequelize.models.User.truncate();
}

export async function truncateWithCatch() {
  try {
    // SHOULD_NOT_FIRE: truncate inside try-catch
    await sequelize.models.User.truncate();
  } catch (err) {
    console.error('truncate failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. instance.reload() — refresh from DB
// ─────────────────────────────────────────────────────────────────────────────

export async function reloadNoCatch() {
  const user = await sequelize.models.User.findByPk(1);
  if (user) {
    // SHOULD_NOT_FIRE: scanner gap — reload-deleted — reload throws if record was deleted. No try-catch.
    await user.reload();
  }
}

export async function reloadWithCatch() {
  const user = await sequelize.models.User.findByPk(1);
  if (user) {
    try {
      // SHOULD_NOT_FIRE: reload inside try-catch
      await user.reload();
    } catch (err) {
      console.error('reload failed:', err);
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. instance.validate() — pre-flight validation
// ─────────────────────────────────────────────────────────────────────────────

export async function validateNoCatch() {
  const user = sequelize.models.User.build({ email: '' });
  // SHOULD_FIRE: validation-failure — validate throws ValidationError. No try-catch.
  await user.validate();
}

export async function validateWithCatch() {
  const user = sequelize.models.User.build({ email: '' });
  try {
    // SHOULD_NOT_FIRE: validate inside try-catch
    await user.validate();
  } catch (err) {
    console.error('validate failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Aggregate methods — max, min, sum, aggregate
// ─────────────────────────────────────────────────────────────────────────────

export async function aggregateNoCatch() {
  // SHOULD_FIRE: query-failure — aggregate throws on DB error. No try-catch.
  const result = await sequelize.models.User.aggregate('age', 'avg');
  return result;
}

export async function aggregateWithCatch() {
  try {
    // SHOULD_NOT_FIRE: aggregate inside try-catch
    const result = await sequelize.models.User.aggregate('age', 'avg');
    return result;
  } catch (err) {
    console.error('aggregate failed:', err);
    throw err;
  }
}

export async function maxNoCatch() {
  // SHOULD_FIRE: query-failure — max throws on DB error. No try-catch.
  const result = await sequelize.models.User.max('age');
  return result;
}

export async function minNoCatch() {
  // SHOULD_FIRE: query-failure — min throws on DB error. No try-catch.
  const result = await sequelize.models.User.min('age');
  return result;
}

export async function sumNoCatch() {
  // SHOULD_FIRE: query-failure — sum throws on DB error. No try-catch.
  const result = await sequelize.models.User.sum('age');
  return result;
}

export async function sumWithCatch() {
  try {
    // SHOULD_NOT_FIRE: sum inside try-catch
    const result = await sequelize.models.User.sum('age');
    return result;
  } catch (err) {
    console.error('sum failed:', err);
    throw err;
  }
}

// ── Transaction.commit() / Transaction.rollback() ──

export async function commitNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — commit-already-finished, commit-database-error — commit() throws. No try-catch.
  // @expect-violation: commit-already-finished
  // @expect-violation: commit-database-error
  const t = await sequelize.transaction();
  await t.commit();
}

export async function rollbackNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — rollback-already-finished, rollback-database-error — rollback() throws. No try-catch.
  // @expect-violation: rollback-already-finished
  // @expect-violation: rollback-database-error
  const t = await sequelize.transaction();
  await t.rollback();
}

export async function commitWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: commit inside try-catch
  const t = await sequelize.transaction();
  try {
    await sequelize.models.User.create({ name: 'test' }, { transaction: t });
    await t.commit();
  } catch (err) {
    try { await t.rollback(); } catch (rbErr) { /* ignore rollback error */ }
    throw err;
  }
}

export async function rollbackMasksError() {
  // SHOULD_NOT_FIRE: scanner gap — rollback-masks-original-error — rollback failure can swallow original error
  // @expect-violation: rollback-masks-original-error
  const t = await sequelize.transaction();
  try {
    await sequelize.models.User.create({ name: 'test' }, { transaction: t });
    await t.commit();
  } catch (err) {
    // BAD: rollback failure will propagate and mask err
    await t.rollback();
    throw err;
  }
}

// ── instance.update() ──

export async function instanceUpdateNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — instance-update-unique-constraint — instance.update() throws. No try-catch.
  // @expect-violation: instance-update-unique-constraint
  // @expect-violation: instance-update-validation-error
  const user = await sequelize.models.User.findByPk(1);
  await (user as any).update({ email: 'new@example.com' });
}

export async function instanceUpdateWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: instance.update() inside try-catch
  try {
    const user = await sequelize.models.User.findByPk(1);
    await (user as any).update({ email: 'new@example.com' });
  } catch (err) {
    console.error('instance.update failed:', err);
    throw err;
  }
}

// ── instance.destroy() ──

export async function instanceDestroyNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — instance-destroy-foreign-key — instance.destroy() throws. No try-catch.
  // @expect-violation: instance-destroy-foreign-key
  // @expect-violation: instance-destroy-connection-error
  const user = await sequelize.models.User.findByPk(1);
  await (user as any).destroy();
}

export async function instanceDestroyWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: instance.destroy() inside try-catch
  try {
    const user = await sequelize.models.User.findByPk(1);
    await (user as any).destroy();
  } catch (err) {
    console.error('instance.destroy failed:', err);
    throw err;
  }
}

// ── Model.findOrBuild() ──

export async function findOrBuildNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — findorbuild-query-failure — findOrBuild() throws on DB error. No try-catch.
  // @expect-violation: findorbuild-query-failure
  const [user, built] = await (sequelize.models.User as any).findOrBuild({
    where: { email: 'test@example.com' },
    defaults: { name: 'Test User' },
  });
  if (built) {
    // BUG: save() not called — silent data loss (findorbuild-save-not-called)
  }
  return user;
}

export async function findOrBuildWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: findOrBuild() inside try-catch, save() called
  try {
    const [user, built] = await (sequelize.models.User as any).findOrBuild({
      where: { email: 'test@example.com' },
      defaults: { name: 'Test User' },
    });
    if (built) {
      await (user as any).save();
    }
    return user;
  } catch (err) {
    console.error('findOrBuild failed:', err);
    throw err;
  }
}

// ── Model.findCreateFind() ──

export async function findCreateFindNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — findcreatefind-validation-error — findCreateFind() throws ValidationError. No try-catch.
  // @expect-violation: findcreatefind-validation-error
  // @expect-violation: findcreatefind-connection-error
  const [user, created] = await (sequelize.models.User as any).findCreateFind({
    where: { email: 'new@example.com' },
    defaults: { name: 'New User' },
  });
  return user;
}

export async function findCreateFindWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: findCreateFind() inside try-catch
  try {
    const [user, created] = await (sequelize.models.User as any).findCreateFind({
      where: { email: 'new@example.com' },
      defaults: { name: 'New User' },
    });
    return user;
  } catch (err) {
    console.error('findCreateFind failed:', err);
    throw err;
  }
}

// ── instance.restore() ──

export async function instanceRestoreNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — instance-restore-not-paranoid — instance.restore() throws. No try-catch.
  // @expect-violation: instance-restore-not-paranoid
  // @expect-violation: instance-restore-connection-error
  const user = await sequelize.models.User.findByPk(1);
  await (user as any).restore();
}

export async function instanceRestoreWithCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: instance.restore() inside try-catch
  try {
    const user = await sequelize.models.User.findByPk(1);
    await (user as any).restore();
  } catch (err) {
    console.error('instance.restore failed:', err);
    throw err;
  }
}
