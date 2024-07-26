const User = require("../Models/User");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }
    const token = crypto.randomBytes(20).toString("hex");
    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );

    const url = `http://localhost:5173/update-password/${token}`;
    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );
    return res.status(200).json({
      success: true,
      message:
        "Email sent successfully,Please check your Email to Continue further",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while sending email",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    if (confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: "Passwords and confirm password does not match",
      });
    }
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }
    if (!(user.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: "Token has expired,Please regenerate your token",
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Password Reset successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
