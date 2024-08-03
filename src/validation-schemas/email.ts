import Joi from 'joi';

export const setSMTPCredentialsSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().required(),
  username: Joi.string().alphanum().required(),
  password: Joi.string().required(),
  sender: Joi.string().email().required(),
});

export const setEmailTemplateSchema = Joi.object({
  subject: Joi.string().required(),
  body: Joi.string().required(),
  redirectUrl: Joi.string().uri().required(),
});
