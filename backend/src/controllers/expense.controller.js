const Expense = require("../models/expense.model");
const User = require("../models/user.model");
const { sendPushNotification } = require("../utils/pushNotification");
const { getBudgetStatusFor } = require("../utils/budgetStatus");


// Create Expense
const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({...req.body , user: req.user.id});

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });

    if (expense.type === "expense") {
      checkBudgetAlert(req.user.id, expense.category);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fires a push notification if this category (or the overall budget) has
// crossed 80% or 100% of its monthly limit. Runs after the response is sent
// so it never delays the user's request.
const checkBudgetAlert = async (userId, category) => {
  try {
    const statuses = await getBudgetStatusFor(userId, category);
    const alertable = statuses.find((s) => s.percent >= 80);
    if (!alertable) return;

    const user = await User.findById(userId);
    if (!user?.pushToken) return;

    const title = alertable.percent >= 100 ? "Budget exceeded" : "Approaching budget limit";
    const body =
      alertable.percent >= 100
        ? `You've gone over your ${alertable.category} budget for this month.`
        : `You've used ${alertable.percent}% of your ${alertable.category} budget this month.`;

    await sendPushNotification(user.pushToken, title, body);
  } catch (error) {
    console.error("Budget alert check failed:", error.message);
  }
};



// Get All Expenses (paginated + filterable)
const getExpenses = async (req, res) => {
  try {
    const {
      page,
      limit,
      type,
      category,
      search,
      startDate,
      endDate,
      sort,
    } = req.query;

    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { notes: regex }];
    }

    const sortMap = {
      date_desc: { date: -1 },
      date_asc: { date: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 },
    };

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort(sortMap[sort]).skip(skip).limit(limit),
      Expense.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// get one expense by id 


const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// update expense by id

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE Expense by ID


const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





// Bulk-restore expenses from a JSON backup. Each item is inserted independently
// so one bad record doesn't fail the whole batch; invalid items are skipped and
// reported back to the caller.
const importExpenses = async (req, res) => {
  try {
    const { expenses } = req.body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No expenses provided to import",
      });
    }

    let imported = 0;
    let failed = 0;

    for (const item of expenses) {
      try {
        const { _id, user, createdAt, updatedAt, __v, ...rest } = item;
        await Expense.create({ ...rest, user: req.user.id });
        imported += 1;
      } catch (error) {
        failed += 1;
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${imported} transaction(s)${failed ? `, skipped ${failed} invalid`
        : ""}.`,
      imported,
      failed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  importExpenses,
};