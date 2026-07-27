const mongoose = require("mongoose");
const dns = require("dns");

// Windows' default DNS stub resolver (127.0.0.1) fails SRV lookups needed
// for mongodb+srv:// URIs even though normal lookups work fine; point Node
// at a public resolver so the Atlas SRV record resolves correctly.
if (process.platform === "win32") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;