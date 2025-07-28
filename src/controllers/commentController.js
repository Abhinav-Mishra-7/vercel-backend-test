const Comment = require('../models/comment') ;
const {io} = require("../index") ;
const SolutionVideo = require('../models/solutionVideo');

// Get all top-level comments for a video, with sorting
const getVideoComments = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { sortBy = 'upvotes' } = req.query; // Default to sorting by upvotes

        const solutionVideo = await SolutionVideo.findOne({problemId: problemId}) ;

        if (!solutionVideo) {
            return res.status(404).json({ message: 'Video not found for this problem' });
        }

        const sortOption = sortBy === 'newest' ? { createdAt: -1 } : { upvoteCount: -1, createdAt: -1 };
 
        // 1. Fetch ALL comments for the video
        const allComments = await Comment.find({ solutionVideo: solutionVideo._id })
            .populate('author')
            .sort({ createdAt: 'asc' }) // Sort by oldest first to build the tree correctly
            .lean();

        // 2. Build a map of comments and separate parents from children
        const commentMap = {};
        const rootComments = [];

        for (const comment of allComments) {
            commentMap[comment._id] = comment;
            comment.replies = []; // Initialize replies array for every comment

            if (comment.parentComment) {
                // If it's a reply, find its parent in the map and push it
                if (commentMap[comment.parentComment]) {
                    commentMap[comment.parentComment].replies.push(comment);
                }
            } else {
                // If it's a top-level comment, add it to the root
                rootComments.push(comment);
            }
        }
        
        // 3. Sort the final top-level comments array based on the query param
        rootComments.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Default to 'upvotes'
            return (b.upvoteCount || 0) - (a.upvoteCount || 0) || (new Date(b.createdAt) - new Date(a.createdAt));
        });


        res.status(200).json(rootComments);

    } catch (error) { 
        console.error('Failed to get video comments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Post a new comment or a reply
const postComment = async (req, res) => {
    // Make sure you have validation here in a real app (e.g., using Joi or express-validator)
    const { content, solutionVideoId, parentCommentId } = req.body;
    const authorId = req.result._id; // From your userMiddleware

    try {
        const newComment = new Comment({
            content,
            solutionVideo: solutionVideoId,
            parentComment: parentCommentId || null,
            author: authorId,
        });

        // If it's a reply, increment the parent's replyCount
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } });
        }

        // const savedComment = await newComment.save();
        const savedComment = await Comment.create(newComment) ;
        // Populate the author details before sending back to the client
        const populatedComment = await Comment.findById(savedComment._id).populate('author').lean() ;

        // if (!populatedComment.parentComment) {
            const io = req.app.get('socketio');
            const roomName = `editorial-room-${solutionVideoId}`;
            io.to(roomName).emit('comment-added', populatedComment);
        // }

        res.status(201).json(populatedComment);
    } catch (error) { 
        console.error('Failed to post comment:', error);
        res.status(400).json({ message: 'Invalid data', error });
    }
};

// Toggle an upvote on a comment
const toggleCommentVote = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        const userId = req.result._id;

        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const upvoteIndex = comment.upvotes.indexOf(userId);
        let isUpvoted;

        if (upvoteIndex > -1) {
            // User has upvoted, so remove the upvote
            comment.upvotes.splice(upvoteIndex, 1);
            isUpvoted = false;
        } else {
            // User has not upvoted, so add the upvote
            comment.upvotes.push(userId);
            isUpvoted = true;
        }

        await comment.save();
        // Send back the full comment object so the client can update its state
        const updatedComment = await Comment.findById(req.params.commentId).populate('author', 'name profilePic');

        const io = req.app.get('socketio');
        const roomName = `editorial-room-${comment.solutionVideo}`;
        io.to(roomName).emit('comment-vote-updated', updatedComment);


        res.json(updatedComment);

    } catch (error) { 
        console.error('Failed to toggle comment vote:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Get replies for a specific comment
const getCommentReplies = async (req, res) => {
    try {
        const replies = await Comment.find({ parentComment: req.params.commentId })
            .populate('author')
            .sort({ createdAt: 1 }); // Replies are usually sorted oldest to newest
        res.json(replies);
    } catch (error) { 
        console.error('Failed to get replies:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getVideoComments, getCommentReplies, postComment, toggleCommentVote };




// const Comment = require('../models/comment');

// // Get all top-level comments for a video, sorted by upvotes
// const getVideoComments = async (req, res) => {
//     try {
//         const comments = await Comment.find({ 
//             solutionVideo: req.params.videoId, 
//             parentComment: null 
//         })
//         .populate('author', 'name profilePic')
//         .sort({ upvotes: -1 });
//         res.json(comments);
//     } catch (error) { res.status(500).json({ message: 'Server Error' }) }
// };

// // Post a new comment or a reply
// const postComment = async (req, res) => {
//     const { content, videoId, parentCommentId } = req.body;
//     const authorId = req.result._id;

//     try {
//         const newComment = new Comment({
//             content,
//             solutionVideo: videoId,
//             parentComment: parentCommentId || null,
//             author: authorId,
//         });

//         const savedComment = await newComment.save();
//         const populatedComment = await Comment.findById(savedComment._id).populate('author', 'name profilePic');
//         res.status(201).json(populatedComment);
//     } catch (error) { res.status(400).json({ message: 'Invalid data', error }) }
// };

// // Toggle an upvote on a comment
// const toggleCommentVote = async (req, res) => {
//     try {
//         const comment = await Comment.findById(req.params.commentId);
//         const userId = req.result._id;
//         if (!comment) return res.status(404).json({ message: 'Comment not found' });

//         const isUpvoted = comment.upvotes.includes(userId);
//         if (isUpvoted) {
//             comment.upvotes.pull(userId);
//         } else {
//             comment.upvotes.push(userId);
//         }
//         await comment.save();
//         res.json({ upvoteCount: comment.upvotes.length, isUpvoted: !isUpvoted });
//     } catch (error) { res.status(500).json({ message: 'Server Error' }) }
// };

// // Get replies for a specific comment
// const getCommentReplies = async (req, res) => {
//     try {
//         const replies = await Comment.find({ parentComment: req.params.commentId })
//             .populate('author', 'name profilePic')
//             .sort({ createdAt: 1 });
//         res.json(replies);
//     } catch (error) { res.status(500).json({ message: 'Server Error' }) }
// };

// module.exports = {getVideoComments , getCommentReplies , postComment , toggleCommentVote} ;