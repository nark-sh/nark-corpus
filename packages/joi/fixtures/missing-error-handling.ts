import Joi from 'joi';
const schema = Joi.object({ name: Joi.string().required() });
async function validateWithoutHandling(data: any) {
  return await schema.validateAsync(data);
}
