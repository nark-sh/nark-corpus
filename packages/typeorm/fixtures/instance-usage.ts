/**
 * Instance Usage for typeorm
 */

import { DataSource, Repository } from 'typeorm';

class DatabaseService {
  private dataSource: DataSource;
  
  constructor() {
    this.dataSource = new DataSource({ type: 'sqlite', database: ':memory:' });
  }
  
  // ❌ No error handling
  async init() {
    await this.dataSource.initialize();
  }
  
  // ❌ No error handling
  async getRepository(entity: any): Promise<Repository<any>> {
    return this.dataSource.getRepository(entity);
  }
}

const dataSource = new DataSource({ type: 'sqlite', database: 'test.db' });
dataSource.initialize(); // ❌ No error handling

export { DatabaseService };
