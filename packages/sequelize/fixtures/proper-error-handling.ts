/**
 * Sequelize Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling.
 * Should NOT trigger violations.
 */

import { Sequelize, Model, DataTypes } from 'sequelize';

/**
 * ✅ Proper error handling for authentication
 */
async function testConnectionWithErrorHandling() {
  const sequelize = new Sequelize('sqlite::memory:');

  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for findAll
 */
async function findAllUsersWithErrorHandling(sequelize: Sequelize) {
  try {
    const users = await sequelize.models.User.findAll();
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for create with constraint violations
 */
async function createUserWithErrorHandling(sequelize: Sequelize, email: string) {
  try {
    const user = await sequelize.models.User.create({ email });
    return user;
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('User with this email already exists');
    }
    throw error;
  }
}

/**
 * ✅ Proper error handling for transactions
 */
async function transactionWithErrorHandling(sequelize: Sequelize) {
  try {
    await sequelize.transaction(async (t) => {
      await sequelize.models.User.create({ email: 'test@example.com' }, { transaction: t });
      await sequelize.models.Profile.create({ userId: 1 }, { transaction: t });
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for raw queries
 */
async function rawQueryWithErrorHandling(sequelize: Sequelize) {
  try {
    const [results] = await sequelize.query('SELECT * FROM users WHERE active = ?', {
      replacements: [true],
    });
    return results;
  } catch (error) {
    console.error('Raw query failed:', error);
    throw error;
  }
}
