const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo , getVideoForProblem, toggleLike} = require("../controllers/videoSection");
const userMiddleware = require('../middleware/userMiddleware');

videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideo);
videoRouter.get("/getVideo/:problemId" , userMiddleware , getVideoForProblem) ;
videoRouter.get("/like/:videoId" , userMiddleware , toggleLike)
module.exports = videoRouter; 