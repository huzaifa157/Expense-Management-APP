const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .required()
});


const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .required(),

  password: Joi.string()
    .required(),
});


const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = {
    registerSchema , loginSchema , forgotPasswordSchema , resetPasswordSchema

};