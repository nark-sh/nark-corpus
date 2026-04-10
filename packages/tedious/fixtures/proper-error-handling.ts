/**
 * tedious Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling.
 * Should NOT trigger violations.
 *
 * Note: tedious uses events, shown with promisified versions
 */

import { Connection, Request, TYPES } from 'tedious';

/**
 * ✅ Proper error handling for connection
 */
async function connectWithErrorHandling() {
  return new Promise<Connection>((resolve, reject) => {
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
      } else {
        resolve(connection);
      }
    });

    connection.on('error', (err) => {
      console.error('Connection error:', err);
      reject(err);
    });

    connection.connect();
  });
}

/**
 * ✅ Proper error handling for execSql
 */
async function execSqlWithErrorHandling(connection: Connection) {
  return new Promise<any[]>((resolve, reject) => {
    const rows: any[] = [];

    const request = new Request('SELECT * FROM users', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });

    request.on('row', (columns) => {
      rows.push(columns);
    });

    request.on('error', (err) => {
      console.error('Query error:', err);
      reject(err);
    });

    connection.execSql(request);
  });
}

/**
 * ✅ Proper error handling for parameterized query
 */
async function parameterizedQueryWithErrorHandling(connection: Connection, userId: number) {
  return new Promise<any>((resolve, reject) => {
    const request = new Request('SELECT * FROM users WHERE id = @userId', (err, rowCount) => {
      if (err) {
        reject(err);
      } else {
        resolve(rowCount);
      }
    });

    request.addParameter('userId', TYPES.Int, userId);

    request.on('error', (err) => {
      console.error('Query error:', err);
      reject(err);
    });

    connection.execSql(request);
  });
}

/**
 * ✅ Proper error handling for stored procedure
 */
async function callProcedureWithErrorHandling(connection: Connection) {
  return new Promise((resolve, reject) => {
    const request = new Request('EXEC GetUserById @userId = 1', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });

    request.on('error', (err) => {
      console.error('Procedure error:', err);
      reject(err);
    });

    connection.callProcedure(request);
  });
}
