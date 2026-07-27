const mongoose = require("mongoose");
const { ALL_CATEGORIES } = require("../constants/categories");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ALL_CATEGORIES,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
    },

    receiptImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model("Expense", expenseSchema);