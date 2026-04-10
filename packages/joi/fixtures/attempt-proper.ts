import Joi from 'joi';

// ✅ Proper: Joi.attempt() wrapped in try-catch
function parseNumber(value: any): number | null {
  try {
    const validated = Joi.attempt(value, Joi.number());
    return validated;
  } catch (error) {
    console.error('Not a valid number:', error);
    return null;
  }
}

// ✅ Proper: Joi.attempt() with error handling and re-throw
function validateAndTransform(data: any) {
  try {
    const validated = Joi.attempt(data, Joi.object({
      count: Joi.number().integer().required()
    }));
    return validated;
  } catch (error) {
    throw new Error(`Invalid data: ${error}`);
  }
}
