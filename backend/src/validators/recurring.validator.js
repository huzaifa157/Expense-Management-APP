const Joi = require("joi");
const { ALL_CATEGORIES } = require("../constants/categories");

const recurringSchema = Joi.object({
  title: Joi.string().trim().required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid("income", "expense").required(),
  category: Joi.string()
    .trim()
    .valid(...ALL_CATEGORIES)
    .required(),
  notes: Joi.string().trim().allow("").optional(),
  frequency: Joi.string().valid("daily", "weekly", "monthly", "yearly").required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null).optional(),
});

module.exports = { recurringSchema };
