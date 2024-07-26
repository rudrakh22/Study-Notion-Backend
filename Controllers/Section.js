const Course = require("../Models/Course");
const SubSection = require("../Models/SubSection");
const Section = require("../Models/Section");

exports.createSection = async (req, res) => {
  try {
    const { courseId, sectionName } = req.body;
    if (!courseId || !sectionName) {
      return res.status(400).json({
        success: false,
        message: "Please provide courseId and sectionName",
      });
    }
    const newSection = await Section.create({ sectionName });
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while creating section",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionId, courseId, sectionName } = req.body;
    const section = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: sectionName,
      },
      { new: true }
    );
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    res.status(200).json({
      success: true,
      message: section,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating section",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    await Course.findByIdAndUpdate(courseId, {
      $pull: { courseContent: sectionId },
    });
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(400).json({
        success: false,
        message: "Section not found",
      });
    }
    await SubSection.deleteMany({ _id: { $in: section.subSection } });
    await Section.findByIdAndDelete(sectionId);
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while deleting section",
      error: error.message,
    });
  }
};
