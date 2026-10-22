const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required."
      });
    }

    const user = await User.findById(req.user.id).select("role");

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required."
      });
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = adminMiddleware;
