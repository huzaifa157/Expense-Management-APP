const mongoose = require("mongoose");
const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");

const monthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

// Returns { category, monthlyLimit, spent, percent } for every budget the user has set,
// computed against the current calendar month's expenses.
const getBudgetStatuses = async (userId) => {
  const { start, end } = monthRange();

  const budgets = await Budget.find({ user: userId });
  if (budgets.length === 0) return [];

  const spendByCategory = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: "expense",
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } },
  ]);

  const spendMap = Object.fromEntries(spendByCategory.map((s) => [s._id, s.spent]));
  const overallSpent = spendByCategory.reduce((sum, s) => sum + s.spent, 0);

  return budgets.map((budget) => {
    const spent = budget.category === "Overall" ? overallSpent : spendMap[budget.category] || 0;

    return {
      _id: budget._id,
      category: budget.category,
      monthlyLimit: budget.monthlyLimit,
      spent,
      percent: Math.round((spent / budget.monthlyLimit) * 100),
    };
  });
};

// Returns the budget status for a single category (and "Overall"), used right after an
// expense is created to decide whether to fire a push alert.
const getBudgetStatusFor = async (userId, category) => {
  const statuses = await getBudgetStatuses(userId);
  return statuses.filter((s) => s.category === category || s.category === "Overall");
};

module.exports = { getBudgetStatuses, getBudgetStatusFor, monthRange };
