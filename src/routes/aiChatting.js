const express = require('express');
const aiRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
// const solveDoubt = require('../controllers/solveDoubt');
const {solveDoubtStream} = require('../controllers/solveDoubtStream');

// aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.post('/chat-stream', userMiddleware, solveDoubtStream);

module.exports = aiRouter;