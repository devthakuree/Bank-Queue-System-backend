const express = require("express");
const {
  createCounter,
  getCounters,
  callNextToken,
  completeCurrentToken,
} = require("../controllers/counterController");
const { requireAuth, requireAdminOrStaff } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireAdminOrStaff);

router.post("/", createCounter);
router.get("/", getCounters);
router.patch("/:counterId/call-next", callNextToken);
router.patch("/:counterId/complete", completeCurrentToken);

module.exports = router;
