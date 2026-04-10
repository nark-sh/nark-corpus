/**
 * Instance Usage for Hapi
 */

import Hapi from '@hapi/hapi';

class ServerManager {
  private server: Hapi.Server;
  
  constructor() {
    this.server = Hapi.server({ port: 3000 });
  }
  
  // ❌ No error handling
  async start() {
    await this.server.start();
  }
  
  // ❌ No error handling in route
  setupRoutes() {
    this.server.route({
      method: 'GET',
      path: '/',
      handler: async () => ({ message: 'Hello' })
    });
  }
}

export { ServerManager };
