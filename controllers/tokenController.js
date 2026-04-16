const Service = require("../models/Service");
const Token = require("../models/Token");

const getTodayQueueDate = () => new Date().toISOString().split("T")[0];

const buildQueueInsights = async (token) => {
  const populatedToken = await Token.findById(token._id).populate("service");

  const waitingTokens = await Token.find({
    status: "waiting",
  }).populate("service");

  const sameServiceQueue = waitingTokens
    .filter(
      (queueToken) =>
        queueToken.service._id.toString() === populatedToken.service._id.toString()
    )
    .sort(
      (firstToken, secondToken) =>
        new Date(firstToken.createdAt) - new Date(secondToken.createdAt)
    );

  const position =
    sameServiceQueue.findIndex(
      (queueToken) => queueToken._id.toString() === populatedToken._id.toString()
    ) + 1;

  const higherOrEqualPriorityAhead = waitingTokens.filter((queueToken) => {
    const isCreatedEarlier =
      new Date(queueToken.createdAt) <= new Date(populatedToken.createdAt);

    if (!isCreatedEarlier) {
      return false;
    }

    const priorityWeight = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return (
      queueToken._id.toString() !== populatedToken._id.toString() &&
      priorityWeight[queueToken.priorityLevel] >=
        priorityWeight[populatedToken.priorityLevel]
    );
  });

  const estimatedWaitingTime =
    higherOrEqualPriorityAhead.length * populatedToken.service.averageServiceTime;

  return {
    position,
    estimatedWaitingTime,
  };
};

const createToken = async (request, response) => {
  try {
    const { customerName, serviceId } = request.body;

    if (!customerName || !serviceId) {
      return response.status(400).json({
        message: "Customer name and service are required.",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service || !service.isActive) {
      return response.status(404).json({
        message: "Selected service is not available.",
      });
    }

    const queueDate = getTodayQueueDate();
    const latestToken = await Token.findOne({ queueDate }).sort({ serialNumber: -1 });
    const serialNumber = latestToken ? latestToken.serialNumber + 1 : 1;
    const tokenNumber = `${service.code}-${String(serialNumber).padStart(3, "0")}`;

    const token = await Token.create({
      tokenNumber,
      customerName,
      service: service._id,
      priorityLevel: service.priorityLevel,
      queueDate,
      serialNumber,
    });

    const insights = await buildQueueInsights(token);
    const populatedToken = await Token.findById(token._id).populate("service");

    return response.status(201).json({
      message: "Token generated successfully.",
      token: populatedToken,
      queueInfo: insights,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to generate token.",
      error: error.message,
    });
  }
};

const getTokenById = async (request, response) => {
  try {
    const token = await Token.findById(request.params.id)
      .populate("service")
      .populate("counter");

    if (!token) {
      return response.status(404).json({
        message: "Token not found.",
      });
    }

    const queueInfo = await buildQueueInsights(token);

    return response.json({
      token,
      queueInfo,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch token details.",
      error: error.message,
    });
  }
};

module.exports = {
  createToken,
  getTokenById,
};
