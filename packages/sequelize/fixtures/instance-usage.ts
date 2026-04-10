/**
 * Sequelize Fixtures - Instance Usage
 *
 * Tests detection of Sequelize usage via instances and models.
 */

import { Sequelize, Model, DataTypes } from 'sequelize';

class User extends Model {}

/**
 * ❌ Instance method without error handling
 * Should trigger ERROR violation
 */
async function useSequelizeInstanceWithoutErrorHandling() {
  const sequelize = new Sequelize('sqlite::memory:');

  User.init({
    email: DataTypes.STRING,
  }, { sequelize });

  // ❌ No try-catch
  await sequelize.sync();
  const user = await User.create({ email: 'test@example.com' });

  return user;
}

/**
 * ❌ Model methods without error handling
 * Should trigger ERROR violations
 */
async function useModelMethodsWithoutErrorHandling() {
  const sequelize = new Sequelize('sqlite::memory:');

  User.init({
    email: DataTypes.STRING,
  }, { sequelize });

  // ❌ Multiple operations without try-catch
  await User.findAll();
  await User.findOne({ where: { email: 'test@example.com' } });
  await User.count();
}

/**
 * ✅ Proper error handling for instance methods
 */
async function useSequelizeInstanceWithErrorHandling() {
  const sequelize = new Sequelize('sqlite::memory:');

  try {
    User.init({
      email: DataTypes.STRING,
    }, { sequelize });

    await sequelize.sync();
    const user = await User.create({ email: 'test@example.com' });
    return user;
  } catch (error) {
    console.error('Sequelize operation failed:', error);
    throw error;
  }
}
