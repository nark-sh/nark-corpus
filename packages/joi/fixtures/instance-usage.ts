import Joi from 'joi';
class Validator {
  private schema = Joi.object({ email: Joi.string().email() });
  async validate(data: any) {
    return await this.schema.validateAsync(data);
  }
}
