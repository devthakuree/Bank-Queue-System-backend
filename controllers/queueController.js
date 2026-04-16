const Counter = require("../models/Counter");
const Service = require("../models/Service");
const Token = require("../models/Token");

const getQueueOverview = async (request, response) => {
  try {
    const [services, counters, waitingTokens, servingTokens] = await Promise.all([
      Service.find({ isActive: true }).sort({ priorityLevel: 1, name: 1 }),
      Counter.find().populate({
        path: "currentToken",
        populate: { path: "service" },
      }),
      Token.find({ status: "waiting" })
        .populate("service")
        .sort({ createdAt: 1 }),
      Token.find({ status: "serving" })
        .populate("service")
        .populate("counter")
        .sort({ calledAt: 1 }),
    ]);

    const serviceQueues = services.map((service) => {
      const tokens = waitingTokens.filter(
        (token) => token.service._id.toString() === service._id.toString()
      );

      return {
        serviceId: service._id,
        serviceName: service.name,
        serviceCode: service.code,
        serviceType: service.serviceType,
        priorityLevel: service.priorityLevel,
        averageServiceTime: service.averageServiceTime,
        waitingCount: tokens.length,
        waitingTokens: tokens,
      };
    });

    const queueSummary = {
      totalWaiting: waitingTokens.length,
      totalServing: servingTokens.length,
      totalCompleted: await Token.countDocuments({ status: "completed" }),
    };

    return response.json({
      summary: queueSummary,
      services,
      serviceQueues,
      servingTokens,
      counters,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch queue overview.",
      error: error.message,
    });
  }
};

const getTokenQueueStatus = async (request, response) => {
  try {
    const token = await Token.findById(request.params.id)
      .populate("service")
      .populate("counter");

    if (!token) {
      return response.status(404).json({
        message: "Token not found.",
      });
    }

    const waitingTokens = await Token.find({
    status: "waiting",
    service: token.service._id,
  }).sort({ createdAt: 1 });

    const position =
      token.status === "waiting"
        ? waitingTokens.findIndex(
            (queueToken) => queueToken._id.toString() === token._id.toString()
          ) + 1
        : 0;

  const tokensAhead =
    token.status === "waiting"
      ? waitingTokens.filter(
          (queueToken) =>
            queueToken._id.toString() !== token._id.toString() &&
            new Date(queueToken.createdAt) <= new Date(token.createdAt)
        )
      : [];

    return response.json({
      token,
      queueInfo: {
        position,
        estimatedWaitingTime:
          token.status === "waiting"
            ? tokensAhead.length * token.service.averageServiceTime
            : 0,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch token queue status.",
      error: error.message,
    });
  }
};

module.exports = {
  getQueueOverview,
  getTokenQueueStatus,
};
