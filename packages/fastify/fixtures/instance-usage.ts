import fastify from 'fastify';
class ApiServer {
  private app = fastify();
  setupRoutes() {
    this.app.get('/data', async () => {
      return await this.getData();
    });
  }
  async getData() { /* ... */ }
}
