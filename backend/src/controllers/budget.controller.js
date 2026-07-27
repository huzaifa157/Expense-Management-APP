const Budget = require("../models/budget.model");
const { getBudgetStatuses } = require("../utils/budgetStatus");

// Create or update the budget for a category (one budget per user+category)
const upsertBudget = async (req, res) => {
  try {
    const { category, monthlyLimit } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category },
      { monthlyLimit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Budget saved",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// List all budgets for the user with this month's spend + percent used
const getBudgets = async (req, res) => {
  try {
    const statuses = await getBudgetStatuses(req.user.id);

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { upsertBudget, getBudgets, deleteBudget };
