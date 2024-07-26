const bcrypt = require("bcrypt");
const User = require("../Models/User");
const OTP = require("../Models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../Models/Profile");
require("dotenv").config();

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      accountType,
      contactNumber,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match. Please check again.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue...",
      });
    }

    const response = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!response || !response.otp) {
      // OTP not found for the email or it's empty
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    if (otp !== response.otp) {
      // Invalid OTP
      return res.status(401).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let approved = "";

    if (approved === "Instructor") {
      approved = false;
    } else {
      approved = true;
    }

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      contactNumber,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    res.status(200).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while creating user",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered with us, Please signUp to continue",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        message: "Login successful",
        user,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Login failure ,Please try again",
    });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    let otp = generateOTPAsString(6);

    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = generateOTPAsString(6);
      result = await OTP.findOne({ otp: otp });
    }

    const otpDetails = await OTP.create({
      email,
      otp,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while sending OTP",
    });
  }
};

function generateOTPAsString(length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1) + min);
  return otp.toString();
}

exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;
    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: hashedPassword },
      { new: true }
    );
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated successfully",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
    } catch (error) {
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
    });
  }
};
