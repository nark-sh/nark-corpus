import fastify from 'fastify';
const app = fastify();
app.get('/user', async (request, reply) => {
  try {
    const data = await fetchUserData();
    return { data };
  } catch (error) {
    reply.code(500).send({ error: 'Failed' });
  }
});
