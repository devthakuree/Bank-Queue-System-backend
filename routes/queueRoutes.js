const express = require("express");
const {
  getQueueOverview,
  getTokenQueueStatus,
} = require("../controllers/queueController");

const router = express.Router();

router.get("/overview", getQueueOverview);
router.get("/token/:id", getTokenQueueStatus);

module.exports = router;
