const Joi = require("joi");
const { ALL_CATEGORIES } = require("../constants/categories");

const budgetSchema = Joi.object({
  category: Joi.string()
    .trim()
    .valid(...ALL_CATEGORIES, "Overall")
    .required(),

  monthlyLimit: Joi.number().positive().required(),
});

module.exports = { budgetSchema };
