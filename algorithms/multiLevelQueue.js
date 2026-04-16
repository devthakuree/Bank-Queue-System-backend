const schedulerState = {
  consecutiveHighServed: 0,
  consecutiveMediumServed: 0,
};

const pickOldestToken = (tokens) => {
  if (!tokens.length) {
    return null;
  }

  return [...tokens].sort(
    (firstToken, secondToken) =>
      new Date(firstToken.createdAt) - new Date(secondToken.createdAt)
  )[0];
};

const updateSchedulerState = (selectedPriority) => {
  if (selectedPriority === "high") {
    schedulerState.consecutiveHighServed += 1;
    schedulerState.consecutiveMediumServed = 0;
    return;
  }

  if (selectedPriority === "medium") {
    schedulerState.consecutiveHighServed = 0;
    schedulerState.consecutiveMediumServed += 1;
    return;
  }

  schedulerState.consecutiveHighServed = 0;
  schedulerState.consecutiveMediumServed = 0;
};

const selectNextToken = (waitingTokens) => {
  const highQueue = waitingTokens.filter(
    (token) => token.priorityLevel === "high"
  );
  const mediumQueue = waitingTokens.filter(
    (token) => token.priorityLevel === "medium"
  );
  const lowQueue = waitingTokens.filter((token) => token.priorityLevel === "low");

  if (!highQueue.length && !mediumQueue.length && !lowQueue.length) {
    return null;
  }

  let selectedToken = null;

  if (highQueue.length && schedulerState.consecutiveHighServed < 3) {
    selectedToken = pickOldestToken(highQueue);
  } else if (mediumQueue.length && schedulerState.consecutiveMediumServed < 2) {
    selectedToken = pickOldestToken(mediumQueue);
  } else if (lowQueue.length) {
    selectedToken = pickOldestToken(lowQueue);
  } else if (highQueue.length) {
    selectedToken = pickOldestToken(highQueue);
  } else if (mediumQueue.length) {
    selectedToken = pickOldestToken(mediumQueue);
  }

  if (!selectedToken) {
    selectedToken =
      pickOldestToken(highQueue) ||
      pickOldestToken(mediumQueue) ||
      pickOldestToken(lowQueue);
  }

  updateSchedulerState(selectedToken.priorityLevel);
  return selectedToken;
};

const resetSchedulerState = () => {
  schedulerState.consecutiveHighServed = 0;
  schedulerState.consecutiveMediumServed = 0;
};

module.exports = {
  schedulerState,
  selectNextToken,
  resetSchedulerState,
};
