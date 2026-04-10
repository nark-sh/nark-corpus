import fastify from 'fastify';
const app = fastify();
app.get('/user', async (request, reply) => {
  const data = await fetchUserData();
  return { data };
});
