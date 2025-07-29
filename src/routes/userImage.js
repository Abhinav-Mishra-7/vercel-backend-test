const express = require('express');
const imageRouter = express.Router();
const { generateProfilePicSignature , updateProfilePicInfo } = require('../controllers/profilePic');
const userMiddleware = require("../middleware/userMiddleware")

// Route to get the signature (lightweight)
imageRouter.get('/generate-upload-signature', userMiddleware, generateProfilePicSignature);

// Route to save the result after upload is complete
imageRouter.put('/update-profile-picture-info', userMiddleware, updateProfilePicInfo);

module.exports = imageRouter ;