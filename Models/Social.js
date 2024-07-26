const mongoose = require("mongoose");


const socialSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
    link:{
    type: String,
    required: true
    },
    user:{
    type: mongoose.Schema.Types.ObjectId,
		ref: "user",
    }
});


const Social = mongoose.model('Social', socialSchema);

module.exports = Social;