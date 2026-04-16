const Counter = require("../models/Counter");
const Token = require("../models/Token");

const createCounter = async (request, response) => {
  try {
    const { name, counterNumber, supportedPriorities, serviceType } = request.body;

    if (!name || !counterNumber) {
      return response.status(400).json({
        message: "Counter name and counter number are required.",
      });
    }

    const existingCounter = await Counter.findOne({ counterNumber });

    if (existingCounter) {
      return response.status(400).json({
        message: "Counter number already exists.",
      });
    }

    const counter = await Counter.create({
      name,
      counterNumber,
      serviceType: serviceType || null,
      supportedPriorities:
        supportedPriorities && supportedPriorities.length
          ? supportedPriorities
          : ["high", "medium", "low"],
    });

    return response.status(201).json({
      message: "Counter created successfully.",
      counter,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to create counter.",
      error: error.message,
    });
  }
};

const getCounters = async (request, response) => {
  try {
    const counters = await Counter.find()
      .populate({
        path: "currentToken",
        populate: { path: "service" },
      })
      .sort({ counterNumber: 1 });

    return response.json({ counters });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch counters.",
      error: error.message,
    });
  }
};

const callNextToken = async (request, response) => {
  try {
    const { counterId } = request.params;
    const counter = await Counter.findById(counterId);

    if (!counter) {
      return response.status(404).json({
        message: "Counter not found.",
      });
    }

    if (counter.currentToken) {
      return response.status(400).json({
        message: "Complete the current token before calling the next one.",
      });
    }

    const allWaitingTokens = await Token.find({
      status: "waiting",
    })
      .populate("service")
      .sort({ createdAt: 1 });

    const waitingTokens =
      counter.serviceType
        ? allWaitingTokens.filter(
            (token) => token.service?.serviceType === counter.serviceType
          )
        : allWaitingTokens;

    if (!waitingTokens.length) {
      return response.status(404).json({
        message: "No waiting tokens available.",
      });
    }

    const selectedToken = waitingTokens[0];

    const updatedToken = await Token.findByIdAndUpdate(
      selectedToken._id,
      {
        status: "serving",
        counter: counter._id,
        calledAt: new Date(),
      },
      { new: true }
    ).populate("service");

    counter.currentToken = updatedToken._id;
    await counter.save();

    return response.json({
      message: "Next token called successfully.",
      token: updatedToken,
      counter,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to call next token.",
      error: error.message,
    });
  }
};

const completeCurrentToken = async (request, response) => {
  try {
    const { counterId } = request.params;
    const counter = await Counter.findById(counterId);

    if (!counter) {
      return response.status(404).json({
        message: "Counter not found.",
      });
    }

    if (!counter.currentToken) {
      return response.status(400).json({
        message: "This counter has no active token.",
      });
    }

    const completedToken = await Token.findByIdAndUpdate(
      counter.currentToken,
      {
        status: "completed",
        completedAt: new Date(),
      },
      { new: true }
    ).populate("service");

    counter.currentToken = null;
    await counter.save();

    return response.json({
      message: "Current token marked as completed.",
      token: completedToken,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to complete token.",
      error: error.message,
    });
  }
};

module.exports = {
  createCounter,
  getCounters,
  callNextToken,
  completeCurrentToken,
};
