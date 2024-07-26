const Social = require("../Models/Social");
const User = require("../Models/User");

// Function to create a new course
exports.createSocial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, link } = req.body;
    if (!platform || !link) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }
    const newSocialLink = await Social.create({
      name: platform,
      link,
      user: userId,
    });
    const userDetails = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          socials: newSocialLink._id,
        },
      },
      { new: true }
    ).populate(["additionalDetails", "socials"]);

    res.status(200).json({
      success: true,
      message: `${platform} Link created Successfully`,
      data: userDetails,
    });
  } catch (error) {
    console.error("error while creating social link", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Social Link",
      error: error.message,
    });
  }
};

exports.updateSocial = async (req, res) => {
  try {
    const { socialId, link } = req.body;
    const id = req.user.id;

    const social = await Social.findById(socialId);
    social.link = link || social.link;
    await social.save();
    const updatedUserDetails = await User.findById(id).populate([
      "additionalDetails",
      "socials",
    ]);

    return res.json({
      success: true,
      message: "Socials updated successfully",
      data: updatedUserDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteSocial = async (req, res) => {
  try {
    const id = req.user.id;
    const { socialId } = req.body;
    const userDetails = await User.findByIdAndUpdate(
      id,
      {
        $pull: { socials: socialId },
      },
      { new: true }
    ).populate(["additionalDetails", "socials"]);
    await Social.findByIdAndDelete({ _id: socialId });

    return res.status(200).json({
      success: true,
      message: "User Social deleted successfully",
      data: userDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "User Social Cannot be deleted successfully",
      });
  }
};
