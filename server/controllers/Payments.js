// const {instance} = require("../config/razorpay");
const Course = require('../models/Course');
const User = require('../models/User');
const {
  courseEnrollmentEmail,
} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');
const {
  paymentSuccessEmail,
} = require('../mail/templates/paymentSuccessEmail');
const crypto = require('crypto');
const CourseProgress = require('../models/CourseProgress');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const mailSender = require('../utils/mailSender');
//capture Payment by creating otp
exports.capturePayment = async (req, res) => {
  try {
    console.log('hey i am payment controler i am clicked');
    const { email } = req.body;
    console.log(email);
    var otp = otpGenerator.generate(6, {
      //generate otp of 6 digit number donot contain uppercase,lowercase,specialchar;
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log('OTP generated: ', otp);

    let result = await OTP.findOne({ otp: otp }); //check unique otp or not
    while (result) {
      // if result is true so we regenerate otp;
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }

    const otpPayload = { email, otp };

    // create an entry in OTP in DB and this OTP is used in SignUp to find response;
    const otpBody = await OTP.create(otpPayload);
    console.log('OTP Body', otpBody);

    res.status(200).json({
      //return response successful
      success: true,
      message: 'OTP Sent Successfully',
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//verify the payment
exports.verifyPayment = async (req, res) => {
  console.log('hi i am verify payment and i am clicked');
  const urlbody = req.body;
  console.log('verigy pyament receiving data', urlbody);
  const { courseId, otp } = req.body;
  console.log(courseId);
  console.log(otp);
  const userId = req.user.id;
  const email = req.user.email;

  const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1); //find most recent OTP stored for the user or most recent OTP generated for user;

  if (response.length === 0) {
    //validate OTP , Lenght 0 so OTP not found
    return res.status(400).json({
      success: false,
      message: 'OTP NOT Found',
    });
  } else if (otp !== response[0].otp) {
    console.log('otp has matched');
    // if otp entered by user != actual otp then PRINT Invalid OTP;
    return res.status(400).json({
      // here otp is entered by user and response[0].otp is generated by controller;
      success: false,
      message: 'Invalid OTP',
    });
  }
  if (otp === response[0].otp) {
    await enrollStudents(courseId, userId, res); //enroll karwao student ko
    return res.status(200).json({ success: true, message: 'Payment Verified' }); //return res
  }
  return res.status(200).json({ success: 'false', message: 'Payment Failed' });
};

//Enroll student
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Please Provide data for Courses or UserId',
    });
  }
  try {
    //find the course and enroll the student in it
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courses },
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      return res
        .status(500)
        .json({ success: false, message: 'Course not Found' });
    }
    // created courseProgress for enrolled Courses in DB;
    const courseProgress = await CourseProgress.create({
      courseID: courses,
      userId: userId,
      completedVideos: [],
    });

    //find the student and add the course to their list of enrolledCOurses
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $push: { courses: courses, courseProgress: courseProgress._id } },
      { new: true }
    );

    ///Send mail to the Student;
    const emailResponse = await mailSender(
      enrollStudents.email,
      `Successfully Enrolled into ${enrolledCourse.courseName}`,
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        `${enrolledStudent.firstName}`
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
