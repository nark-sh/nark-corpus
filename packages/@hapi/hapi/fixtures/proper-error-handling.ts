/**
 * Proper Hapi Error Handling
 * Should produce 0 violations
 */

import Hapi from '@hapi/hapi';

async function startServer() {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });
  
  // ✅ Route with error handling
  server.route({
    method: 'GET',
    path: '/users',
    handler: async (request, h) => {
      try {
        // Logic
        return { users: [] };
      } catch (error) {
        console.error('Handler error:', error);
        throw error;
      }
    }
  });
  
  // ✅ Error handling on start
  try {
    await server.start();
    console.log('Server started');
  } catch (error) {
    console.error('Server start failed:', error);
    throw error;
  }
  
  return server;
}

export { startServer };
