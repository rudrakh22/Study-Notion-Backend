const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: true,
      port: 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true,
    });
    let info = await transporter.sendMail(
      {
        from: "StudyNotion || RudRitz -by Rudraksh",
        to: `${email}`,
        subject: `${title}`,
        html: `${body}`,
      },
      function (error) {
        if (error) {
        } else {
        }
      }
    );
    return info;
  } catch (error) {}
};

module.exports = mailSender;
