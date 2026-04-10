import { createPool, createClient } from '@vercel/postgres';

class DatabaseService {
  private pool = createPool({ connectionString: process.env.POSTGRES_URL });

  // ❌ No try-catch or connection cleanup
  async getUser(id: number) {
    const client = await this.pool.connect();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // ❌ No error handling
  async createUser(name: string, email: string) {
    const client = await this.pool.connect();
    await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
  }
}

export { DatabaseService };
