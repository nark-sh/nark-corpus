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

/**
 * @expect-clean
 * ✅ Proper error handling for execute() (prepared statement)
 */
async function executeWithErrorHandling(connection: Connection) {
  return new Promise<any[]>((resolve, reject) => {
    const rows: any[] = [];
    const request = new Request('SELECT * FROM users WHERE id = @id', (err, rowCount) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });

    request.addParameter('id', TYPES.Int, 42);

    request.on('row', (columns) => {
      rows.push(columns);
    });

    request.on('error', (err) => {
      console.error('Execute error:', err);
      reject(err);
    });

    connection.execute(request, { id: 42 });
  });
}

/**
 * @expect-clean
 * ✅ Proper error handling for execBulkLoad
 */
async function bulkLoadWithErrorHandling(connection: Connection) {
  return new Promise<number>((resolve, reject) => {
    // ✅ BulkLoad callback checks err argument
    const bulkLoad = connection.newBulkLoad('employees', (err, rowCount) => {
      if (err) {
        console.error('Bulk load failed:', err);
        reject(err);
        return;
      }
      console.log(`Successfully inserted ${rowCount} rows`);
      resolve(rowCount ?? 0);
    });

    bulkLoad.addColumn('first_name', { name: 'NVarChar', type: 'nvarchar', length: 255 } as any, { nullable: false });
    bulkLoad.addColumn('last_name', { name: 'NVarChar', type: 'nvarchar', length: 255 } as any, { nullable: false });

    bulkLoad.setTimeout(60000); // 60 second timeout for large datasets

    connection.execBulkLoad(bulkLoad, [
      { first_name: 'Alice', last_name: 'Smith' },
      { first_name: 'Bob', last_name: 'Jones' },
    ]);
  });
}

/**
 * @expect-clean
 * ✅ Proper error handling for saveTransaction
 */
async function saveTransactionWithErrorHandling(connection: Connection) {
  return new Promise<void>((resolve, reject) => {
    // ✅ saveTransaction callback checks err argument
    connection.saveTransaction((err) => {
      if (err) {
        console.error('Failed to set savepoint:', err);
        reject(err);
        return;
      }
      console.log('Savepoint set successfully');
      resolve();
    }, 'my_savepoint');
  });
}

/**
 * @expect-clean
 * ✅ Proper error handling for transaction() helper
 */
async function transactionWithErrorHandling(connection: Connection, name: string) {
  return new Promise<void>((resolve, reject) => {
    // ✅ Both cb(err) and done(err) are checked
    connection.transaction((err, done) => {
      if (err) {
        console.error('Failed to begin transaction:', err);
        reject(err);
        return;
      }

      const request = new Request('INSERT INTO users (name) VALUES (@name)', (reqErr) => {
        if (reqErr) {
          // ✅ done is called with the error to trigger rollback
          done!(reqErr, () => {
            console.error('Transaction rolled back due to insert error:', reqErr);
            reject(reqErr);
          });
          return;
        }
        // ✅ done is called to commit, and commit error is handled
        done!(null, (commitErr) => {
          if (commitErr) {
            console.error('Transaction commit failed:', commitErr);
            reject(commitErr);
          } else {
            resolve();
          }
        });
      });

      request.addParameter('name', TYPES.NVarChar, name);
      request.on('error', (reqErr) => {
        done!(reqErr, () => reject(reqErr));
      });

      connection.execSql(request);
    });
  });
}

/**
 * @expect-clean
 * ✅ Proper error handling for execSqlBatch
 */
async function execSqlBatchWithErrorHandling(connection: Connection) {
  return new Promise<void>((resolve, reject) => {
    // ✅ Request callback checks err argument
    const request = new Request('CREATE TABLE #TempTable (id INT)', (err) => {
      if (err) {
        console.error('execSqlBatch failed:', err);
        reject(err);
        return;
      }
      resolve();
    });

    request.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });

    connection.execSqlBatch(request);
  });
}
