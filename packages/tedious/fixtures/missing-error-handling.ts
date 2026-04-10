/**
 * tedious Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing error handlers).
 * Should trigger ERROR violations.
 */

import { Connection, Request, TYPES } from 'tedious';

/**
 * ❌ Missing error handler for connection
 * Should trigger ERROR violation
 */
async function connectWithoutErrorHandling() {
  return new Promise<Connection>((resolve) => {
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
      resolve(connection);
    });
    // ❌ No error handler

    connection.connect();
  });
}

/**
 * ❌ Missing error handler for execSql
 * Should trigger ERROR violation
 */
async function execSqlWithoutErrorHandling(connection: Connection) {
  return new Promise<any[]>((resolve) => {
    const rows: any[] = [];

    const request = new Request('SELECT * FROM users', () => {
      resolve(rows);
    });

    request.on('row', (columns) => {
      rows.push(columns);
    });
    // ❌ No error handler on request

    connection.execSql(request);
  });
}

/**
 * ❌ Missing error handler for INSERT
 * Should trigger ERROR violation
 */
async function insertWithoutErrorHandling(connection: Connection, name: string) {
  return new Promise<void>((resolve) => {
    const request = new Request('INSERT INTO users (name) VALUES (@name)', () => {
      resolve();
    });

    request.addParameter('name', TYPES.NVarChar, name);
    // ❌ No error handler

    connection.execSql(request);
  });
}

/**
 * ❌ Missing error handler for UPDATE
 * Should trigger ERROR violation
 */
async function updateWithoutErrorHandling(connection: Connection, userId: number, name: string) {
  return new Promise<void>((resolve) => {
    const request = new Request('UPDATE users SET name = @name WHERE id = @userId', () => {
      resolve();
    });

    request.addParameter('name', TYPES.NVarChar, name);
    request.addParameter('userId', TYPES.Int, userId);
    // ❌ No error handler

    connection.execSql(request);
  });
}

/**
 * ❌ Missing error handler for DELETE
 * Should trigger ERROR violation
 */
async function deleteWithoutErrorHandling(connection: Connection, userId: number) {
  return new Promise<void>((resolve) => {
    const request = new Request('DELETE FROM users WHERE id = @userId', () => {
      resolve();
    });

    request.addParameter('userId', TYPES.Int, userId);
    // ❌ No error handler

    connection.execSql(request);
  });
}

/**
 * ❌ Missing error handler for stored procedure
 * Should trigger ERROR violation
 */
async function callProcedureWithoutErrorHandling(connection: Connection) {
  return new Promise((resolve) => {
    const request = new Request('EXEC GetUsers', () => {
      resolve(null);
    });
    // ❌ No error handler

    connection.callProcedure(request);
  });
}
