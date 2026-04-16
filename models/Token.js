const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    priorityLevel: {
      type: String,
      required: true,
      enum: ["high", "medium", "low"],
    },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed"],
      default: "waiting",
    },
    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counter",
      default: null,
    },
    queueDate: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: Number,
      required: true,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
