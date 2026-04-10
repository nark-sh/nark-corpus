/**
 * Missing Hapi Error Handling
 * Should produce ERROR violations
 */

import Hapi from '@hapi/hapi';

// ❌ No error handling on start
async function startServerNoErrorHandling() {
  const server = Hapi.server({ port: 3000 });
  
  // ❌ Route without error handling
  server.route({
    method: 'GET',
    path: '/users',
    handler: async (request, h) => {
      return { users: [] };
    }
  });
  
  await server.start(); // ❌ No try-catch
  
  return server;
}

export { startServerNoErrorHandling };
