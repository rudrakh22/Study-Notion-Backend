const Course = require("../Models/Course");
const RatingAndReview = require("../Models/RatingAndReview");
const { mongoose } = require("mongoose");

exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, rating, review } = req.body;
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }
    const ratingReview = await RatingAndReview.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rating And Review created successfully",
      ratingReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while creating Rating And Review",
      error: error.message,
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;
    const result = await RatingAndReview.aggregate(
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      }
    );

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully",
        data: result[0].averageRating,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Average rating is 0,no rating given till now",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching average rating",
      error: error.message,
    });
  }
};

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching all reviews",
      error: error.message,
    });
  }
};
