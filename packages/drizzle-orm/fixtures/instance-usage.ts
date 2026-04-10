import { drizzle } from 'drizzle-orm/node-postgres';

class UserRepository {
  private db = drizzle(/* connection */);

  // ❌ No error handling
  async findAll() {
    return await this.db.select().from(usersTable);
  }

  async create(data: any) {
    await this.db.insert(usersTable).values(data);
  }
}

export { UserRepository };
