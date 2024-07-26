const express=require('express');
const router=express.Router();
const {auth,isInstructor}=require('../middlewares/auth');
const {
    deleteAccount,
    updateProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard,
}=require('../Controllers/Profile');
const {instructorProfile} = require("../Controllers/User");
const {createSocial,updateSocial,deleteSocial}=require('../Controllers/Socials');

router.delete('/deleteProfile',auth,deleteAccount);
router.put('/updateProfile',auth,updateProfile);
router.get('/getUserDetails',auth,getAllUserDetails)
router.get('/getEnrolledCourses',auth,getEnrolledCourses)
router.put('/updateDisplayPicture',auth,updateDisplayPicture)
router.post("/userProfile",instructorProfile)
router.get('/instructorDashboard',auth,isInstructor,instructorDashboard)


router.post("/createSocial", auth, isInstructor, createSocial);
router.put("/updateSocial", auth , isInstructor, updateSocial);
router.post("/deleteSocial", auth, isInstructor, deleteSocial);

module.exports=router;