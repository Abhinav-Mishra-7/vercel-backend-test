const express = require('express');
const commentRouter = express.Router();
const {getVideoComments , getCommentReplies , postComment , toggleCommentVote} = require('../controllers/commentController');
const userMiddleware = require("../middleware/userMiddleware")

// Get all comments for a video
commentRouter.get('/video/:problemId', getVideoComments);
// Get all replies for a comment
commentRouter.get('/:commentId/replies', getCommentReplies);
// Post a new comment/reply
commentRouter.post('/', userMiddleware, postComment);
// Vote on a comment
commentRouter.post('/:commentId/vote', userMiddleware, toggleCommentVote);

module.exports = commentRouter;