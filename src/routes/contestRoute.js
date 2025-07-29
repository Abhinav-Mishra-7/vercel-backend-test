const express = require('express') ;

const contestRouter = express.Router() ;

const adminMiddleware = require("../middleware/adminMiddleware") ;
const userMiddleware = require("../middleware/userMiddleware") ;
const {createContest,getAllContests,getContestDetails,registerForContest,getLeaderboard} = require("../controllers/contestController") ;

// Create contest (Admin only)
contestRouter.post('/create', adminMiddleware, createContest);

// Get All Contests
contestRouter.get('/', getAllContests);

// Get contest details
contestRouter.get('/:id', userMiddleware , getContestDetails);

// Register contest
contestRouter.post('/:id/register', userMiddleware, registerForContest);

// Leaderboard
contestRouter.get("/:id/leaderboard" , getLeaderboard) ;

module.exports = contestRouter ; 