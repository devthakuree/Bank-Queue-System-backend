const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const buildToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    );

    if (!user) {
      return response.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return response.status(401).json({ message: "Invalid credentials." });
    }

    if (user.role !== "admin" && user.role !== "staff") {
      return response.status(403).json({ message: "Admin/staff login only." });
    }

    const token = buildToken(user);

    return response.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
};

const getMe = async (request, response) => {
  return response.json({
    user: {
      id: request.user._id,
      name: request.user.name,
      email: request.user.email,
      role: request.user.role,
    },
  });
};

module.exports = {
  login,
  getMe,
};

