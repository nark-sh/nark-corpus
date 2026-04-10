/**
 * Mocha Fixtures: Proper Error Handling
 *
 * This file demonstrates CORRECT async error handling patterns in Mocha.
 * These patterns should NOT trigger any violations.
 */

import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import assert from 'assert';

// Simulated async operations
async function fetchUser(id: string): Promise<{ id: string; name: string }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: 'John Doe' }), 10);
  });
}

async function setupDatabase(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 10);
  });
}

async function teardownDatabase(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 10);
  });
}

async function clearTestData(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 10);
  });
}

// ✅ CORRECT: Async/await pattern
describe('Proper async/await tests', () => {
  it('should fetch user with async/await', async () => {
    const user = await fetchUser('123');
    assert.strictEqual(user.name, 'John Doe');
  });

  it('should handle multiple async operations', async () => {
    const user1 = await fetchUser('123');
    const user2 = await fetchUser('456');
    assert.ok(user1);
    assert.ok(user2);
  });

  it('should handle async operations in try/catch', async () => {
    try {
      const user = await fetchUser('123');
      assert.strictEqual(user.name, 'John Doe');
    } catch (error) {
      // Proper error handling
      throw error;
    }
  });
});

// ✅ CORRECT: Promise return pattern
describe('Proper promise return tests', () => {
  it('should fetch user with promise return', () => {
    // MUST return the promise
    return fetchUser('123').then(user => {
      assert.strictEqual(user.name, 'John Doe');
    });
  });

  it('should handle promise chains', () => {
    return fetchUser('123')
      .then(user => {
        assert.ok(user.id);
        return fetchUser('456');
      })
      .then(user2 => {
        assert.ok(user2.id);
      });
  });

  it('should handle promise rejections with catch', () => {
    return Promise.reject(new Error('Expected error'))
      .catch(error => {
        assert.strictEqual(error.message, 'Expected error');
      });
  });
});

// ✅ CORRECT: Suite-level hooks with async/await
describe('Proper hook handling - suite level', () => {
  before(async () => {
    // Proper async setup
    await setupDatabase();
  });

  after(async () => {
    // Proper async cleanup
    await teardownDatabase();
  });

  it('should run after setup', async () => {
    const user = await fetchUser('123');
    assert.ok(user);
  });
});

// ✅ CORRECT: Test-level hooks with async/await
describe('Proper hook handling - test level', () => {
  beforeEach(async () => {
    // Proper async setup before each test
    await clearTestData();
  });

  afterEach(async () => {
    // Proper async cleanup after each test
    await clearTestData();
  });

  it('should run with clean state', async () => {
    const user = await fetchUser('123');
    assert.ok(user);
  });

  it('should run with clean state again', async () => {
    const user = await fetchUser('456');
    assert.ok(user);
  });
});

// ✅ CORRECT: Hooks with promise return
describe('Proper hook handling - promise return', () => {
  before(() => {
    // Return the promise
    return setupDatabase();
  });

  after(() => {
    // Return the promise
    return teardownDatabase();
  });

  beforeEach(() => {
    // Return the promise
    return clearTestData();
  });

  afterEach(() => {
    // Return the promise
    return clearTestData();
  });

  it('should work with promise-based hooks', () => {
    return fetchUser('123').then(user => {
      assert.ok(user);
    });
  });
});

// ✅ CORRECT: Testing expected rejections with async/await
describe('Proper rejection handling', () => {
  it('should handle expected rejection with try/catch', async () => {
    const failingOperation = async () => {
      throw new Error('Expected error');
    };

    try {
      await failingOperation();
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, 'Expected error');
    }
  });

  it('should use assert.rejects for rejection testing', async () => {
    const failingOperation = async () => {
      throw new Error('Expected error');
    };

    await assert.rejects(
      async () => {
        await failingOperation();
      },
      {
        name: 'Error',
        message: 'Expected error'
      }
    );
  });
});

// ✅ CORRECT: Multiple async operations
describe('Proper parallel async operations', () => {
  it('should handle Promise.all correctly', async () => {
    const results = await Promise.all([
      fetchUser('123'),
      fetchUser('456'),
      fetchUser('789')
    ]);

    assert.strictEqual(results.length, 3);
    assert.ok(results.every(user => user.id));
  });

  it('should handle sequential async operations', async () => {
    const user1 = await fetchUser('123');
    assert.ok(user1);

    const user2 = await fetchUser('456');
    assert.ok(user2);

    const user3 = await fetchUser('789');
    assert.ok(user3);
  });
});

// ✅ CORRECT: Nested async operations
describe('Proper nested async operations', () => {
  it('should handle nested async/await', async () => {
    const user = await fetchUser('123');
    assert.ok(user);

    // Nested async operation
    const relatedUser = await fetchUser(user.id);
    assert.strictEqual(relatedUser.id, user.id);
  });

  it('should handle nested promise chains', () => {
    return fetchUser('123')
      .then(user => {
        assert.ok(user);
        // Nested promise - properly returned
        return fetchUser(user.id);
      })
      .then(relatedUser => {
        assert.ok(relatedUser);
      });
  });
});
