const express = require("express");
const router = express.Router();
const { upsertBudget, getBudgets, deleteBudget } = require("../controllers/budget.controller");
const validate = require("../middleware/validate.middleware");
const { budgetSchema } = require("../validators/budget.validator");
const protect = require("../middleware/auth.middleware");

router.get("/", protect, getBudgets);
router.post("/", protect, validate(budgetSchema), upsertBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;
