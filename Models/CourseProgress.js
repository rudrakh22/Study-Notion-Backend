const mongoose = require('mongoose');

const courseProgress=new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
    },
    completedVideos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'SubSection'
        },
    ],
})

module.exports=mongoose.model('courseProgress',courseProgress);