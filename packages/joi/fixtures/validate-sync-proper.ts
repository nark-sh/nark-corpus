import Joi from 'joi';

// ✅ Proper: Check error property before using value
function validateUserSync(data: any) {
  const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().min(0).required()
  });

  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
  return value;
}

// ✅ Proper: Another pattern - early return on error
function validateEmailSync(data: any) {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const result = schema.validate(data);
  if (result.error) {
    console.error('Invalid email:', result.error.details);
    return null;
  }
  return result.value;
}
