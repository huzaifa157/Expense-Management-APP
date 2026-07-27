const cron = require("node-cron");
const { generateDueTransactions } = require("../controllers/recurring.controller");

// Runs hourly and generates any recurring transactions that came due.
const startRecurringJob = () => {
  cron.schedule("0 * * * *", () => {
    generateDueTransactions().catch((error) =>
      console.error("Recurring job failed:", error.message)
    );
  });

  // Also run once on boot so a transaction due while the server was offline
  // still gets created promptly instead of waiting for the next hour mark.
  generateDueTransactions().catch((error) =>
    console.error("Recurring job (startup run) failed:", error.message)
  );
};

module.exports = startRecurringJob;
