const Contact = require("../Models/ContactUs");
const mailSender = require("../utils/mailSender");
const { contactUsEmail } = require("../mail/templates/contactFormRes");

exports.contact = async (req, res) => {
  try {
    const { firstName, lastName, email, message, phoneNumber, countryCode } =
      req.body;
    if (!firstName || !email || !message || !phoneNumber || !countryCode) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    const processedLastName = lastName ? lastName : "";
    const contact = await Contact.create({
      firstName: firstName,
      lastName: processedLastName,
      email: email,
      phoneNumber: `${countryCode} ${phoneNumber}`,
      message: message,
    });

    // sending this to user via email
    await mailSender(
      contact.email,
      "Thanks for your Response -RudRitz",
      contactUsEmail(contact)
    );

    // mail Sended to the owner
    await mailSender(
      "rudrakshg43453@gmail.com",
      `Got Response from ${contact.firstName}`,
      contactUsEmail(contact)
    );

    res.status(200).json({
      success: true,
      message: "Contact Details create successfully",
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
