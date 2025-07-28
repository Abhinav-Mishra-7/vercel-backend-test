
const express = require("express") ;

const submitRouter = express.Router() ;

const userMiddleware = require("../middleware/userMiddleware") ;
const submitCodeRateLimiter = require("../middleware/submitCodeRateLimiter") ;
const {submitCode , runCode} = require("../controllers/userSubmission") ;

// submit code
submitRouter.post("/submit/:id" , userMiddleware , submitCodeRateLimiter , submitCode) ;


submitRouter.post("/run/:id" , userMiddleware , submitCodeRateLimiter , runCode) ;


module.exports = submitRouter ;

