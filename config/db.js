const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || "";
    const mongoUri = rawUri.trim();

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is missing. Set it in server/.env (example: mongodb://127.0.0.1:27017/bank_queue_system)."
      );
    }

    const jwtSecret = (process.env.JWT_SECRET || "").trim();
    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET is missing. Set it in server/.env (example: JWT_SECRET=mySecretKey123)."
      );
    }

    const looksLikeAtlasSrv = mongoUri.startsWith("mongodb+srv://");
    const missingDbName =
      looksLikeAtlasSrv &&
      /mongodb\.net\/(\?|$)/.test(mongoUri);

    if (missingDbName) {
      const defaultDbName = process.env.MONGO_DB_NAME || "bank_queue_system";
      const parts = mongoUri.split("?");
      const base = parts[0].replace(/\/$/, "");
      const query = parts[1] ? `?${parts[1]}` : "";
      console.warn(
        `MongoDB URI had no database name. Auto-using '${defaultDbName}'.`
      );
      await mongoose.connect(`${base}/${defaultDbName}${query}`);
      console.log("MongoDB connected successfully");
      return;
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (String(error.message || "").includes("ECONNREFUSED")) {
      console.error(
        "Tip: If using MongoDB Atlas, check Atlas Network Access (IP whitelist) and ensure your internet/firewall allows outbound connections."
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
