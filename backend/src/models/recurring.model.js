const mongoose = require("mongoose");
const { ALL_CATEGORIES } = require("../constants/categories");

const recurringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    category: {
      type: String,
      required: true,
      enum: ALL_CATEGORIES,
    },

    notes: {
      type: String,
      default: "",
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },

    nextRunDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

recurringSchema.index({ active: 1, nextRunDate: 1 });
recurringSchema.index({ user: 1 });

module.exports = mongoose.model("Recurring", recurringSchema);
