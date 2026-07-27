const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const expenseRoutes = require("./routes/expense.route");
const authRoutes = require("./routes/auth.route");
const budgetRoutes = require("./routes/budget.route");
const recurringRoutes = require("./routes/recurring.route");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
// Higher limit than the default 100kb so requests carrying a receipt photo
// (base64-encoded) don't get rejected.
app.use(express.json({ limit: "5mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}



app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/budgets", budgetRoutes);
app.use("/api/recurring", recurringRoutes);


// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running 🚀",
  });
});

module.exports = app;