const express  = require("express");
const router = express.Router();

// import handlers
const {contact} = require("../Controllers/ContactUs");

//router
router.post("/contact", contact);

module.exports = router;