const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});

async function sendEmailVerification(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp)
    );
    //
  } catch (error) {
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    sendEmailVerification(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
