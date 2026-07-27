const Recurring = require("../models/recurring.model");
const Expense = require("../models/expense.model");
const User = require("../models/user.model");
const { sendPushNotification } = require("../utils/pushNotification");
const { getBudgetStatusFor } = require("../utils/budgetStatus");

const advanceDate = (date, frequency) => {
  const next = new Date(date);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

const createRecurring = async (req, res) => {
  try {
    const { startDate, ...rest } = req.body;

    const recurring = await Recurring.create({
      ...rest,
      user: req.user.id,
      nextRunDate: new Date(startDate),
    });

    res.status(201).json({
      success: true,
      message: "Recurring transaction created",
      data: recurring,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecurring = async (req, res) => {
  try {
    const items = await Recurring.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Only supports toggling active on/off — full edits aren't needed for this feature.
const toggleRecurring = async (req, res) => {
  try {
    const recurring = await Recurring.findOne({ _id: req.params.id, user: req.user.id });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring transaction not found",
      });
    }

    recurring.active = !recurring.active;
    await recurring.save();

    res.status(200).json({
      success: true,
      data: recurring,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteRecurring = async (req, res) => {
  try {
    const recurring = await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recurring transaction deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Called by the cron job: finds every active recurring transaction that is due,
// creates the corresponding expense/income entry, and advances it to its next
// occurrence (deactivating it once it passes its end date).
const generateDueTransactions = async () => {
  const now = new Date();
  const due = await Recurring.find({ active: true, nextRunDate: { $lte: now } });

  for (const item of due) {
    await Expense.create({
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      notes: item.notes,
      date: item.nextRunDate,
      user: item.user,
    });

    const next = advanceDate(item.nextRunDate, item.frequency);
    item.nextRunDate = next;

    if (item.endDate && next > item.endDate) {
      item.active = false;
    }

    await item.save();

    const user = await User.findById(item.user);
    if (user?.pushToken) {
      await sendPushNotification(
        user.pushToken,
        "Recurring transaction added",
        `${item.title} — ${item.amount} was automatically added.`
      );

      if (item.type === "expense") {
        const statuses = await getBudgetStatusFor(item.user, item.category);
        const overBudget = statuses.find((s) => s.percent >= 100);
        if (overBudget) {
          await sendPushNotification(
            user.pushToken,
            "Budget exceeded",
            `You've gone over your ${overBudget.category} budget for this month.`
          );
        }
      }
    }
  }
};

module.exports = {
  createRecurring,
  getRecurring,
  toggleRecurring,
  deleteRecurring,
  generateDueTransactions,
};
