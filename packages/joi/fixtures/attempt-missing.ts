import Joi from 'joi';

// ❌ Missing: Joi.attempt() without try-catch
function parseNumberBad(value: any) {
  const validated = Joi.attempt(value, Joi.number());  // Will crash on invalid input
  return validated;
}

// ❌ Missing: Joi.attempt() used without error handling
function convertToEmail(input: any) {
  const email = Joi.attempt(input, Joi.string().email());  // No try-catch
  return email.toLowerCase();
}

// ❌ Missing: Joi.attempt() in validation chain
function processUserInput(data: any) {
  const schema = Joi.object({
    username: Joi.string().required(),
    age: Joi.number().required()
  });

  const result = Joi.attempt(data, schema);  // No error handling
  return result;
}
