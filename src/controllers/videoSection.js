const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");
const { sanitizeFilter } = require('mongoose');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );
    const title = problem.title ;
    const description = problem.description ;

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
      title,
      description
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};

const saveVideoMetadata = async (req, res) => {
  try {
    const {problemId,cloudinaryPublicId,secureUrl,duration , title , description} = req.body;

    const userId = req.result._id;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Check if video already exists for this problem and user
    const existingVideo = await SolutionVideo.findOne({problemId,userId,cloudinaryPublicId});

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

    // console.log(cloudinaryResource) ;

    const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
      resource_type: 'video',
      transformation: [
        { width: 400, crop: 'scale' },
        { quality: 'auto' },
        { fetch_format: 'jpg' }
      ],
      video_sampling: 5, // Create thumbnail from 5th frame
    });

   
    const videoSolution = await SolutionVideo.create({
      problemId: problemId ,
      userId: userId ,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl ,
      title ,
      description
    });

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        title: videoSolution.title,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};


const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
    
   

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

// controllers/videoController.js

const toggleLike = async (req, res) => {
    try {
        // Here we use videoId from the URL params, not problemId
        const { videoId } = req.params; 
        const userId = req.result._id;

        const video = await SolutionVideo.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video solution not found' });
        }

        const io = req.app.get('socketio');
        const roomName = `editorial-room-${videoId}`;

        
        const likeIndex = video.likes.indexOf(userId);

        if (likeIndex > -1) {
            // User has liked it, so unlike it by removing the userId
            video.likes.splice(likeIndex, 1);
        } else {
            // User has not liked it, so like it by adding the userId
            video.likes.push(userId);
        }

        await video.save();

        const updatedLikes = video.likes;

        io.to(roomName).emit('like-updated', { 
            videoId: video._id,
            likes: video.likes 
        });
        
        // Return the new like count and whether the current user has liked it
        res.json({ 
            likes: video.likes
        });

    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// controllers/videoController.js

// Rename and improve this function
const getVideoForProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    if (!problemId) {
      return res.status(400).json({ error: "Problem ID is required" });
    }

    // Use .find() instead of .findOne() to get all solutions
    // Also, populate the user's info and sort by newest first or by likes
    const videoSolutions = await SolutionVideo.findOne({problemId})
      .populate('userId', 'name profilePic') // Fetch uploader's name and picture
      .sort({ createdAt: -1 }); // Show newest videos first

    if (!videoSolutions || videoSolutions.length === 0) {
      return res.status(404).json({ message: "No video solutions found for this problem" });
    }

    

    res.status(200).send(videoSolutions);

  } catch (err) {
    console.error("Error fetching videos for problem:", err);
    res.status(500).json({ message: "Server error while fetching videos" });
  }
};


module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo , getVideoForProblem , toggleLike};