const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");
const startRecurringJob = require("./jobs/recurringJob");

dotenv.config();

connectDB();

if (process.env.NODE_ENV !== "test") {
  startRecurringJob();
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});