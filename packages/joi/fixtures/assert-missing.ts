import Joi from 'joi';

// ❌ Missing: Joi.assert() without try-catch
function validateWithAssertBad(data: any) {
  Joi.assert(data, Joi.number());  // Will crash if data is not a number
  console.log('Validation passed');
}

// ❌ Missing: Joi.assert() in function without error handling
function assertUserAge(age: any) {
  Joi.assert(age, Joi.number().min(0).max(150));  // No try-catch
  return age;
}
