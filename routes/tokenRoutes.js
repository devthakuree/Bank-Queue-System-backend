const express = require("express");
const {
  createToken,
  getTokenById,
} = require("../controllers/tokenController");

const router = express.Router();

router.post("/", createToken);
router.get("/:id", getTokenById);

module.exports = router;
