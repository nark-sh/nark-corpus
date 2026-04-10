/**
 * Mocha Fixtures: Missing Error Handling
 *
 * This file demonstrates INCORRECT async error handling patterns in Mocha.
 * These patterns SHOULD trigger violations (UnhandledPromiseRejectionWarning, timeout errors).
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

// ❌ VIOLATION: Promise not returned (MOST COMMON BUG - 60-70%)
describe('Missing promise return', () => {
  it('should trigger violation - promise not returned', () => {
    // ❌ Promise created but NOT returned - test passes immediately!
    fetchUser('123').then(user => {
      assert.strictEqual(user.name, 'John Doe');
    });
    // Test already completed - assertion never runs!
  });

  it('should trigger violation - promise chain not returned', () => {
    // ❌ Promise chain not returned
    fetchUser('123')
      .then(user => {
        assert.ok(user.id);
        return fetchUser('456');
      })
      .then(user2 => {
        assert.ok(user2.id);
      });
    // Silent failure - test passes without waiting
  });
});

// ❌ VIOLATION: Missing await keyword (30-40% frequency)
describe('Missing await keyword', () => {
  it('should trigger violation - missing await', async () => {
    // ❌ Async operation not awaited
    fetchUser('123'); // Missing await!

    // Test continues immediately without waiting
    assert.ok(true); // Runs before fetchUser completes
  });

  it('should trigger violation - fire and forget promise', async () => {
    const user = await fetchUser('123');
    assert.ok(user);

    // ❌ Fire-and-forget promise (not awaited)
    fetchUser('456'); // Missing await! Unhandled rejection possible
  });
});

// ❌ VIOLATION: Hooks without return or await (50-60% frequency)
describe('Hooks without proper async handling', () => {
  before(() => {
    // ❌ Promise not returned - tests start before setup completes
    setupDatabase();
  });

  after(() => {
    // ❌ Promise not returned - resources not properly cleaned up
    teardownDatabase();
  });

  beforeEach(() => {
    // ❌ Promise not returned - test state pollution
    clearTestData();
  });

  afterEach(() => {
    // ❌ Promise not returned - test state pollution
    clearTestData();
  });

  it('should run with potentially dirty state', async () => {
    // This test may fail due to hooks not completing
    const user = await fetchUser('123');
    assert.ok(user);
  });
});

// ❌ VIOLATION: Assertion in promise catch block (40-50% frequency)
describe('Assertions in catch blocks', () => {
  it('should trigger violation - assertion in catch causes timeout', () => {
    return fetchUser('123')
      .then(() => {
        // Expecting rejection but got success
        assert.fail('Should have rejected');
      })
      .catch(error => {
        // ❌ Assertion throws → unhandled rejection → timeout
        assert.strictEqual(error.code, 'EXPECTED_CODE');
      });
    // Results in timeout error instead of assertion error
  });

  it('should trigger violation - complex catch with assertion', () => {
    return Promise.reject(new Error('Test error'))
      .catch(error => {
        // ❌ Multiple assertions in catch - any failure causes timeout
        assert.ok(error);
        assert.strictEqual(error.message, 'Different message'); // This fails → timeout
      });
  });
});

// ❌ VIOLATION: Async operation in synchronous describe (15-20% frequency)
describe('Async in describe block', async () => {
  // ❌ describe() MUST be synchronous - Mocha doesn't await this!
  const userData = await fetchUser('123'); // NOT awaited by Mocha!

  it('should have undefined user data', () => {
    // userData is likely undefined because describe didn't wait
    assert.ok(userData); // May fail
  });
});

// ❌ VIOLATION: Promise.all without await
describe('Promise.all not awaited', () => {
  it('should trigger violation - Promise.all not awaited', async () => {
    // ❌ Promise.all not awaited
    Promise.all([
      fetchUser('123'),
      fetchUser('456'),
      fetchUser('789')
    ]); // Missing await!

    assert.ok(true); // Runs before Promise.all completes
  });
});

// ❌ VIOLATION: Nested promises not returned
describe('Nested promises not handled', () => {
  it('should trigger violation - nested promise not returned', () => {
    return fetchUser('123')
      .then(user => {
        assert.ok(user);

        // ❌ Nested promise NOT returned
        fetchUser(user.id).then(relatedUser => {
          assert.ok(relatedUser);
        });

        // Returns undefined, not the nested promise
      });
  });
});

// ❌ VIOLATION: Error in async operation not caught
describe('Unhandled async errors', () => {
  it('should trigger violation - unhandled rejection', async () => {
    const failingOperation = async () => {
      throw new Error('Unhandled error');
    };

    // ❌ Call async function that throws, but don't await or catch
    failingOperation(); // Unhandled promise rejection!

    assert.ok(true);
  });

  it('should trigger violation - promise rejection not handled', () => {
    // ❌ Create promise that rejects but don't handle it
    return fetchUser('123').then(user => {
      assert.ok(user);

      // Create rejecting promise but don't catch it
      Promise.reject(new Error('Unhandled'));
    });
  });
});

// ❌ VIOLATION: Resource leak (25-35% frequency)
describe('Resource leak in hooks', () => {
  // Simulated server
  const server = {
    close: async () => {
      return new Promise<void>(resolve => {
        setTimeout(() => resolve(), 10);
      });
    }
  };

  after(() => {
    // ❌ Async cleanup not awaited - Mocha hangs
    server.close(); // Should be: await server.close()
  });

  it('should run test', async () => {
    assert.ok(true);
  });
  // After this test suite, Mocha may hang waiting for resources to close
});

// ❌ VIOLATION: Timeout used to mask async bug (30-40% frequency)
describe('Timeout masking real bug', () => {
  it('should trigger violation - timeout hides missing return', function() {
    this.timeout(5000); // Increased timeout to hide bug

    // ❌ Promise not returned - timeout just delays the error
    fetchUser('123').then(user => {
      assert.ok(user);
    });
  });
});

// ❌ VIOLATION: Multiple async issues in one test
describe('Multiple async violations', () => {
  beforeEach(() => {
    // ❌ Hook promise not returned
    clearTestData();
  });

  it('should trigger multiple violations', async () => {
    // ❌ Missing await
    fetchUser('123');

    // ❌ Fire-and-forget promise
    Promise.resolve().then(() => {
      assert.ok(true);
    });

    // Test completes immediately
  });
});
