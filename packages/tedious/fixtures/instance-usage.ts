/**
 * tedious Fixtures - Instance Usage
 *
 * Tests detection of tedious usage via Connection and Request instances.
 */

import { Connection, Request, TYPES } from 'tedious';

/**
 * ❌ Connection and Request instances without error handlers
 * Should trigger ERROR violations
 */
async function useConnectionInstanceWithoutErrorHandling() {
  return new Promise<void>((resolve) => {
    const connection = new Connection({
      server: 'localhost',
      authentication: {
        type: 'default',
        options: {
          userName: 'sa',
          password: 'Password123'
        }
      }
    });

    connection.on('connect', () => {
      const request = new Request('SELECT * FROM users', () => {
        resolve();
      });
      // ❌ No error handler on request

      connection.execSql(request);
    });
    // ❌ No error handler on connection

    connection.connect();
  });
}

/**
 * ❌ Multiple requests without error handlers
 * Should trigger ERROR violations
 */
async function multipleRequestsWithoutErrorHandling(connection: Connection) {
  return new Promise<void>((resolve) => {
    const request1 = new Request('SELECT * FROM users', () => {});
    // ❌ No error handler

    const request2 = new Request('SELECT * FROM products', () => {
      resolve();
    });
    // ❌ No error handler

    connection.execSql(request1);
    connection.execSql(request2);
  });
}

/**
 * ✅ Proper error handling for connection and requests
 */
async function useInstancesWithErrorHandling() {
  return new Promise<void>((resolve, reject) => {
    const connection = new Connection({
      server: 'localhost',
      authentication: {
        type: 'default',
        options: {
          userName: 'sa',
          password: 'Password123'
        }
      }
    });

    connection.on('connect', (err) => {
      if (err) {
        reject(err);
        return;
      }

      const request = new Request('SELECT * FROM users', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      request.on('error', reject);
      connection.execSql(request);
    });

    connection.on('error', reject);
    connection.connect();
  });
}
