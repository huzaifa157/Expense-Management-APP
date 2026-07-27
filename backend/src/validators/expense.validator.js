const Joi = require("joi");
const { ALL_CATEGORIES } = require("../constants/categories");

const expenseSchema = Joi.object({
  title: Joi.string().trim().required(),

  amount: Joi.number().positive().required(),

  category: Joi.string()
    .trim()
    .valid(...ALL_CATEGORIES)
    .required(),

  type: Joi.string()
    .valid("income", "expense")
    .required(),

  date: Joi.date().required(),

  notes: Joi.string().trim().allow("").optional(),

  receiptImage: Joi.string().allow("").optional(),
});

const expenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(500).default(20),
  type: Joi.string().valid("income", "expense"),
  category: Joi.string()
    .trim()
    .valid(...ALL_CATEGORIES),
  search: Joi.string().trim().max(100),
  startDate: Joi.date(),
  endDate: Joi.date(),
  sort: Joi.string().valid("date_desc", "date_asc", "amount_desc", "amount_asc").default("date_desc"),
});

module.exports = {
  expenseSchema,
  expenseQuerySchema,
};
