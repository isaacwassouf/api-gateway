import Joi from 'joi';

export const registerAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  passwordConfirmation: Joi.string().required().valid(Joi.ref('password')),
});

export const loginAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
