/**
 * Instance Usage for knex
 */

import knex from 'knex';

class DatabaseService {
  private db: knex.Knex;
  
  constructor() {
    this.db = knex({ client: 'pg', connection: {} });
  }
  
  // ❌ No try-catch
  async query(table: string) {
    return await this.db(table).select('*');
  }
  
  // ❌ No try-catch
  async insert(table: string, data: any) {
    return await this.db(table).insert(data);
  }
}

const db = knex({ client: 'sqlite3', connection: ':memory:' });
db('users').select('*'); // ❌ No error handling

export { DatabaseService };
