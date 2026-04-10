/**
 * Mocha Fixtures: Instance Usage and Edge Cases
 *
 * This file tests various Mocha function usage patterns and edge cases,
 * including proper and improper handling of different async patterns.
 */

import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import assert from 'assert';

// Test class/instance pattern
class DatabaseService {
  private connected: boolean = false;

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        resolve();
      }, 10);
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = false;
        resolve();
      }, 10);
    });
  }

  async query(sql: string): Promise<any[]> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    return Promise.resolve([{ id: 1, data: 'test' }]);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// ✅ CORRECT: Instance-based async operations with proper handling
describe('Instance usage - proper handling', () => {
  const db = new DatabaseService();

  before(async () => {
    // ✅ Proper async instance method in hook
    await db.connect();
  });

  after(async () => {
    // ✅ Proper async instance method cleanup
    await db.disconnect();
  });

  it('should use instance method with async/await', async () => {
    // ✅ Proper instance method call
    const results = await db.query('SELECT * FROM users');
    assert.ok(Array.isArray(results));
  });

  it('should check connection state', () => {
    // Synchronous instance method - no async needed
    assert.strictEqual(db.isConnected(), true);
  });
});

// ❌ VIOLATION: Instance-based async operations without proper handling
describe('Instance usage - missing async handling', () => {
  const db = new DatabaseService();

  before(() => {
    // ❌ Instance method returns promise but not awaited/returned
    db.connect();
  });

  after(() => {
    // ❌ Instance method returns promise but not awaited/returned
    db.disconnect();
  });

  it('should trigger violation - instance method not awaited', async () => {
    // ❌ Instance method call not awaited
    db.query('SELECT * FROM users'); // Missing await!
    assert.ok(true);
  });
});

// Edge case: Timeout configuration
describe('Timeout configuration edge cases', () => {
  it('should work with custom timeout', function() {
    // ✅ Proper timeout configuration (must use function keyword)
    this.timeout(3000);

    return new Promise((resolve) => {
      setTimeout(resolve, 2500);
    });
  });

  // ❌ VIOLATION: Arrow function with this.timeout
  it('should trigger violation - arrow function with timeout', () => {
    // ❌ this.timeout() doesn't work with arrow functions
    // @ts-ignore - intentionally wrong for testing
    this.timeout(3000); // Error: Cannot read property 'timeout' of undefined

    return Promise.resolve();
  });
});

// Edge case: Dynamic test generation
describe('Dynamic test generation', () => {
  const testCases = ['user1', 'user2', 'user3'];

  testCases.forEach(userId => {
    it(`should fetch ${userId}`, async () => {
      // ✅ Proper async handling in dynamically generated tests
      const user = await Promise.resolve({ id: userId, name: 'Test User' });
      assert.strictEqual(user.id, userId);
    });
  });

  // ❌ VIOLATION: Dynamic test without proper async
  testCases.forEach(userId => {
    it(`should trigger violation for ${userId}`, () => {
      // ❌ Promise not returned
      Promise.resolve({ id: userId }).then(user => {
        assert.ok(user);
      });
    });
  });
});

// Edge case: Nested describe blocks
describe('Outer describe', () => {
  let outerDb: DatabaseService;

  before(async () => {
    outerDb = new DatabaseService();
    await outerDb.connect();
  });

  after(async () => {
    await outerDb.disconnect();
  });

  describe('Nested describe - proper handling', () => {
    it('should access outer scope resource', async () => {
      // ✅ Can access resources from outer scope
      const results = await outerDb.query('SELECT 1');
      assert.ok(results);
    });
  });

  describe('Nested describe - improper handling', () => {
    beforeEach(() => {
      // ❌ Async operation in nested hook without return/await
      outerDb.query('DELETE FROM test');
    });

    it('should have potential race condition', async () => {
      // May run before beforeEach completes
      const results = await outerDb.query('SELECT * FROM test');
      assert.ok(results);
    });
  });
});

// Edge case: Skip and only
describe('Skip and only edge cases', () => {
  it.skip('should skip this test', async () => {
    // Even skipped tests should have proper async handling
    await Promise.resolve();
  });

  // This would run exclusively if .only is used
  it('should run normally', async () => {
    await Promise.resolve();
    assert.ok(true);
  });
});

// Edge case: Multiple assertions on same promise
describe('Multiple assertions on promise', () => {
  it('should handle multiple assertions properly', async () => {
    // ✅ Proper pattern - await once, assert multiple times
    const result = await Promise.resolve({ id: 1, name: 'Test', age: 30 });

    assert.strictEqual(result.id, 1);
    assert.strictEqual(result.name, 'Test');
    assert.strictEqual(result.age, 30);
  });

  it('should trigger violation - multiple unawaited promises', async () => {
    // ❌ Creating multiple promises without awaiting
    Promise.resolve({ id: 1 }); // Missing await!
    Promise.resolve({ name: 'Test' }); // Missing await!
    Promise.resolve({ age: 30 }); // Missing await!

    assert.ok(true);
  });
});

// Edge case: Conditional async logic
describe('Conditional async logic', () => {
  it('should handle conditional await properly', async () => {
    const shouldFetch = true;

    if (shouldFetch) {
      // ✅ Proper conditional async
      const data = await Promise.resolve('data');
      assert.ok(data);
    } else {
      assert.ok(true);
    }
  });

  it('should trigger violation - conditional promise not returned', () => {
    const shouldFetch = true;

    if (shouldFetch) {
      // ❌ Promise created but not returned or awaited
      Promise.resolve('data').then(data => {
        assert.ok(data);
      });
    }
  });
});

// Edge case: Error handling in hooks
describe('Error handling in hooks', () => {
  before(async () => {
    // ✅ Proper error handling in hook
    try {
      await Promise.reject(new Error('Setup error'));
    } catch (error) {
      // Handle or re-throw as needed
      console.log('Setup failed, continuing anyway');
    }
  });

  it('should run even if hook had handled error', async () => {
    await Promise.resolve();
    assert.ok(true);
  });
});

describe('Unhandled error in hook - prevents tests', () => {
  before(async () => {
    // ❌ Unhandled rejection in hook - all tests will be skipped
    await Promise.reject(new Error('Fatal setup error'));
  });

  it('should never run - hook failed', async () => {
    // This test will be skipped due to before() hook failure
    assert.ok(true);
  });
});

// Edge case: Promise.race and Promise.all
describe('Promise combinators', () => {
  it('should handle Promise.all properly', async () => {
    // ✅ Proper Promise.all usage
    const results = await Promise.all([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]);

    assert.strictEqual(results.length, 3);
  });

  it('should handle Promise.race properly', async () => {
    // ✅ Proper Promise.race usage
    const result = await Promise.race([
      Promise.resolve('first'),
      new Promise(resolve => setTimeout(() => resolve('second'), 100))
    ]);

    assert.strictEqual(result, 'first');
  });

  it('should trigger violation - Promise.all not awaited', async () => {
    // ❌ Promise.all not awaited
    Promise.all([
      Promise.resolve(1),
      Promise.resolve(2)
    ]); // Missing await!

    assert.ok(true);
  });
});

// Edge case: Async iteration
describe('Async iteration', () => {
  it('should handle for...of with async properly', async () => {
    const items = [1, 2, 3];

    // ✅ Proper sequential async iteration
    for (const item of items) {
      await Promise.resolve(item);
    }

    assert.ok(true);
  });

  it('should trigger violation - forEach with async', async () => {
    const items = [1, 2, 3];

    // ❌ forEach doesn't wait for async operations
    items.forEach(async item => {
      await Promise.resolve(item); // These run in parallel, not awaited
    });

    // Test completes before all async operations finish
    assert.ok(true);
  });
});

// Edge case: Nested async/await
describe('Nested async operations', () => {
  it('should handle deeply nested async/await', async () => {
    // ✅ Proper deep nesting with await at each level
    const level1 = await Promise.resolve('level1');
    assert.ok(level1);

    const level2 = await Promise.resolve(level1 + '-level2');
    assert.ok(level2);

    const level3 = await Promise.resolve(level2 + '-level3');
    assert.strictEqual(level3, 'level1-level2-level3');
  });

  it('should trigger violation - missing await at nested level', async () => {
    const level1 = await Promise.resolve('level1');

    // ❌ Missing await at nested level
    Promise.resolve(level1 + '-level2').then(level2 => {
      return Promise.resolve(level2 + '-level3');
    }); // Not awaited!

    assert.ok(true);
  });
});
