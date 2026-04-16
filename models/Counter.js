const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    counterNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    serviceType: {
      type: String,
      enum: ["cash", "account", "inquiry"],
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    currentToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    supportedPriorities: {
      type: [String],
      enum: ["high", "medium", "low"],
      default: ["high", "medium", "low"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counter", counterSchema);
