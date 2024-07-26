const CourseProgress = require("../Models/CourseProgress");
const SubSection = require("../Models/SubSection");
const Section = require("../Models/Section");
const mongoose = require("mongoose");
const Course = require("../Models/Course");

exports.updateCourseProgress = async (req, res) => {
  const userId = req.user.id;
  const { courseId, subSectionId } = req.body;
  try {
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userID: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      });
    } else {
      if (courseProgress.completedVideos.includes(subSectionId)) {
        return res.status(400).json({
          success: false,
          error: "SubSection already completed",
        });
      }
      courseProgress.completedVideos.push(subSectionId);
    }
    await courseProgress.save();
    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating course progress",
      error: error.message,
    });
  }
};
