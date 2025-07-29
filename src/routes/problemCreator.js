const express = require("express") ;
const {createProblem , updateProblem , deleteProblem , getProblemById , getAllProblems , solvedAllProblemByUser , submittedProblem} = require("../controllers/userProblem") ;


const problemRouter = express.Router() ;

const adminMiddleware = require("../middleware/adminMiddleware") ;
const userMiddleware = require("../middleware/userMiddleware") ;

// Create
problemRouter.post('/create' , adminMiddleware , createProblem) ;
// update
problemRouter.put('/update/:id' , adminMiddleware , updateProblem) ;
// // delete
problemRouter.delete('/delete/:id' , adminMiddleware , deleteProblem) ;


// fetch
problemRouter.get('/problemById/:id' , userMiddleware , getProblemById) ;
// fetch all problems
problemRouter.get('/getAllProblems' , userMiddleware , getAllProblems) ;
// problems solved by user
problemRouter.get('/problemSolvedByUser' , userMiddleware , solvedAllProblemByUser) ;
// fetching the submissions for a problem solved by user
problemRouter.get("/submittedProblem/:id", userMiddleware , submittedProblem) ;


module.exports = problemRouter ;