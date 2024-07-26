const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:['Admin','Student','Instructor'],
        required:true,
    },
    active:{
        type:Boolean,
        default:true,
    },
    approved:{
        type:Boolean,
        default:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Profile',
    },
    socials: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Social",
        },
    ],
    courses:[
        {  
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course',
        },
    ],
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    image:{
        type:String,
        // required:true,
        default:"",
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'CourseProgress',
        },
    ]
},
{timeStamp:true}
);

module.exports=mongoose.model('User',userSchema);