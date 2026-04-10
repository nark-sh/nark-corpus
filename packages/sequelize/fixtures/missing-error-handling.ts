/**
 * Sequelize Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations.
 */

import { Sequelize, Model, DataTypes } from 'sequelize';

/**
 * ❌ Missing try-catch for authenticate
 * Should trigger ERROR violation
 */
async function testConnectionWithoutErrorHandling() {
  const sequelize = new Sequelize('postgresql://localhost/testdb');
  await sequelize.authenticate();
  console.log('Connection established.');
}

/**
 * ❌ Missing try-catch for findAll
 * Should trigger ERROR violation
 */
async function findAllUsersWithoutErrorHandling(sequelize: Sequelize) {
  const users = await sequelize.models.User.findAll();
  return users;
}

/**
 * ❌ Missing try-catch for findOne
 * Should trigger ERROR violation
 */
async function findUserByIdWithoutErrorHandling(sequelize: Sequelize, id: number) {
  const user = await sequelize.models.User.findByPk(id);
  return user;
}

/**
 * ❌ Missing try-catch for create
 * Should trigger ERROR violation
 */
async function createUserWithoutErrorHandling(sequelize: Sequelize, email: string) {
  const user = await sequelize.models.User.create({ email });
  return user;
}

/**
 * ❌ Missing try-catch for update
 * Should trigger ERROR violation
 */
async function updateUserWithoutErrorHandling(sequelize: Sequelize, id: number, name: string) {
  await sequelize.models.User.update({ name }, { where: { id } });
}

/**
 * ❌ Missing try-catch for destroy
 * Should trigger ERROR violation
 */
async function deleteUserWithoutErrorHandling(sequelize: Sequelize, id: number) {
  await sequelize.models.User.destroy({ where: { id } });
}

/**
 * ❌ Missing try-catch for transaction
 * Should trigger ERROR violations
 */
async function transactionWithoutErrorHandling(sequelize: Sequelize) {
  await sequelize.transaction(async (t) => {
    await sequelize.models.User.create({ email: 'test@example.com' }, { transaction: t });
    await sequelize.models.Profile.create({ userId: 1 }, { transaction: t });
  });
}

/**
 * ❌ Missing try-catch for raw query
 * Should trigger ERROR violation
 */
async function rawQueryWithoutErrorHandling(sequelize: Sequelize) {
  const [results] = await sequelize.query('SELECT * FROM users');
  return results;
}

/**
 * ❌ Missing try-catch for count
 * Should trigger ERROR violation
 */
async function countUsersWithoutErrorHandling(sequelize: Sequelize) {
  const count = await sequelize.models.User.count();
  return count;
}
