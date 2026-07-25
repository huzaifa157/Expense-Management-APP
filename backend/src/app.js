const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const expenseRoutes = require("./routes/expense.route");
const authRoutes = require("./routes/auth.route");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}



app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes)


// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running 🚀",
  });
});

module.exports = app;