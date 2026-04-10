import Joi from 'joi';
const schema = Joi.object({ name: Joi.string().required() });
async function validateWithHandling(data: any) {
  try {
    return await schema.validateAsync(data);
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}
