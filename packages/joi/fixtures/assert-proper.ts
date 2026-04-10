import Joi from 'joi';

// ✅ Proper: Joi.assert() wrapped in try-catch
function validateWithAssert(data: any) {
  const schema = Joi.number().min(0);

  try {
    Joi.assert(data, schema);
    console.log('Validation passed');
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}

// ✅ Proper: Joi.assert() with error handling
function assertEmail(email: string) {
  try {
    Joi.assert(email, Joi.string().email());
    return true;
  } catch (error) {
    return false;
  }
}
