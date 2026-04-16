const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return response.status(401).json({ message: "Authorization token missing." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) {
      return response.status(401).json({ message: "Invalid token user." });
    }

    request.user = user;
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
};

const requireAdminOrStaff = (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized." });
  }

  if (request.user.role !== "admin" && request.user.role !== "staff") {
    return response.status(403).json({ message: "Admin/staff access required." });
  }

  return next();
};

module.exports = {
  requireAuth,
  requireAdminOrStaff,
};
