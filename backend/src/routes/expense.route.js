const express = require("express");
const router = express.Router();
const { createExpense , getExpenses , getExpenseById , updateExpense , deleteExpense } = require("../controllers/expense.controller");
const validate = require("../middleware/validate.middleware");
const { validateQuery } = require("../middleware/validate.middleware");
const { expenseSchema, expenseQuerySchema } = require("../validators/expense.validator");
const protect = require("../middleware/auth.middleware");


router.get("/", protect, validateQuery(expenseQuerySchema), getExpenses);

router.get("/:id", protect, getExpenseById);

router.post("/", protect, validate(expenseSchema), createExpense);

router.put("/:id", protect, validate(expenseSchema), updateExpense);

router.delete("/:id", protect, deleteExpense);

module.exports = router;