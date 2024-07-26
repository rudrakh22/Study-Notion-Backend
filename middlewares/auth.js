const User = require("../Models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while verifying token",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is the protected route for student",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "User role cannot be verified",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is the protected route for admin",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "User role cannot be verified",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is the protected route for Instructor",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "User role cannot be verified",
    });
  }
};
