import Joi from 'joi';

// ❌ Missing: Not destructuring error at all
function validateUserBad1(data: any) {
  const schema = Joi.object({
    name: Joi.string().required()
  });

  const { value } = schema.validate(data);
  return value;  // Using value without checking error
}

// ❌ Missing: Destructuring error but not checking it
function validateUserBad2(data: any) {
  const schema = Joi.object({
    age: Joi.number().required()
  });

  const { error, value } = schema.validate(data);
  // error is captured but never checked
  return value;  // Using value without checking if error exists
}

// ❌ Missing: Direct property access without checking error
function validateUserBad3(data: any) {
  const schema = Joi.string().email();
  const value = schema.validate(data).value;  // Direct .value access
  return value;
}
