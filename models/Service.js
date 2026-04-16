const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["cash", "account", "inquiry"],
    },
    priorityLevel: {
      type: String,
      required: true,
      enum: ["high", "medium", "low"],
    },
    averageServiceTime: {
      type: Number,
      default: 5,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
