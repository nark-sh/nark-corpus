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

/**
 * @expect-violation: execute-parameter-validation-error
 * @expect-violation: execute-invalid-state-error
 * ❌ Missing error handler for execute (prepared statement execution)
 * Should trigger ERROR violation
 */
async function executeWithoutErrorHandling(connection: Connection) {
  return new Promise<any[]>((resolve) => {
    const rows: any[] = [];
    const prepareRequest = new Request('SELECT * FROM users WHERE id = @id', () => {
      resolve(rows);
    });
    // ❌ No error handler on the execute request
    connection.execute(prepareRequest, { id: 42 });
  });
}

/**
 * @expect-violation: bulk-load-constraint-violation
 * @expect-violation: bulk-load-timeout
 * ❌ Missing error handler for execBulkLoad
 * Should trigger ERROR violation
 */
async function bulkLoadWithoutErrorHandling(connection: Connection) {
  // ❌ BulkLoad callback ignores err argument — silent failure
  const bulkLoad = connection.newBulkLoad('employees', (err, rowCount) => {
    if (rowCount) {
      console.log(`Inserted ${rowCount} rows`);
    }
    // ❌ err is ignored — constraint violations, timeouts will be swallowed
  });

  bulkLoad.addColumn('first_name', { name: 'NVarChar', type: 'nvarchar', length: 255 } as any, { nullable: false });
  bulkLoad.addColumn('last_name', { name: 'NVarChar', type: 'nvarchar', length: 255 } as any, { nullable: false });

  connection.execBulkLoad(bulkLoad, [
    { first_name: 'Alice', last_name: 'Smith' },
    { first_name: 'Bob', last_name: 'Jones' },
  ]);
}

/**
 * @expect-violation: save-transaction-state-error
 * @expect-violation: save-transaction-connection-error
 * ❌ Missing error handler for saveTransaction
 * Should trigger ERROR violation
 */
async function saveTransactionWithoutErrorHandling(connection: Connection) {
  // ❌ saveTransaction callback ignores err argument
  connection.saveTransaction(() => {
    // Callback never checks for errors — savepoint failures are silently swallowed
    console.log('Savepoint set');
  }, 'my_savepoint');
}

/**
 * @expect-violation: transaction-begin-error
 * @expect-violation: transaction-commit-error
 * ❌ Missing error handler for transaction() helper
 * Should trigger ERROR violation
 */
async function transactionWithoutErrorHandling(connection: Connection) {
  // ❌ Outer error (begin failure) is ignored
  connection.transaction((err, done) => {
    // ❌ err is not checked — if begin fails, done is undefined
    const request = new Request('INSERT INTO users (name) VALUES (@name)', (reqErr) => {
      if (!reqErr) {
        // ❌ done callback error is ignored
        done!(null);
      }
    });
    request.on('error', () => {}); // suppress for fixture
    connection.execSql(request);
  });
}

/**
 * @expect-violation: exec-sql-batch-invalid-state
 * ❌ Missing error handler for execSqlBatch
 * Should trigger ERROR violation
 */
async function execSqlBatchWithoutErrorHandling(connection: Connection) {
  return new Promise<void>((resolve) => {
    // ❌ No error handler on the request — concurrent state errors silently lost
    const request = new Request('CREATE TABLE #TempTable (id INT)', () => {
      resolve();
    });
    connection.execSqlBatch(request);
  });
}
