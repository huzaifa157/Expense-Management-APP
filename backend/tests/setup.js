const mongoose = require("mongoose");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

// No live DB in the test environment: fail fast instead of buffering/hanging.
mongoose.set("bufferCommands", false);
