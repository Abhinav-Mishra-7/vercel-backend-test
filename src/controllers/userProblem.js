const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById , submitBatch , submitToken , verifyReferenceSolutions} = require("../utils/problemUtility") ;
const SolutionVideo = require("../models/solutionVideo") ;


const createProblem = async (req, res) => {
    // Destructure all required fields from the frontend, including 'constraints'
    const { title, description, constraints, difficulty, tags, visibleTestCases, functionName ,hiddenTestCases, startCode, referenceSolution } = req.body;

    try {
        // 1. Verify the reference solutions first
        console.log("Starting verification of reference solutions...");
        const verificationResult = await verifyReferenceSolutions(
            referenceSolution, 
            visibleTestCases,
            functionName,
            tags 
        );
        
        if (!verificationResult.isValid) {
            console.error("Verification Failed:", verificationResult.message);
            // Send a clear error message to the frontend
            return res.status(400).json({ message: `Problem validation failed: ${verificationResult.message}` });
        }
        console.log("Verification successful.");

        // 2. If verification passes, create the problem in the database
        // The problemCreator ID comes from your authentication middleware
        const newProblem = {
            title,
            description,
            constraints,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.result._id ,
            functionName
        };

        const problem = await Problem.create(newProblem);
        console.log("Problem created successfully in DB:", problem._id);

        res.status(201).json({ message: "Problem created successfully!", problem });

    } catch (err) {
        console.error("Error in createProblem controller:", err);
        // Provide a structured error response
        res.status(500).json({ message: "An internal server error occurred.", error: err.message });
    }
};

// Updating a problem
const updateProblem = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Problem ID is missing." });
    }

    try {
        const problemToUpdate = await Problem.findById(id);
        if (!problemToUpdate) {
            return res.status(404).json({ message: "Problem not found with the given ID." });
        }
        
        const { visibleTestCases, referenceSolution } = req.body;

        // 1. Verify the updated reference solutions
        console.log(`Starting verification for updating problem ${id}...`);
        const verificationResult = await verifyReferenceSolutions(referenceSolution, visibleTestCases);

        if (!verificationResult.isValid) {
            console.error("Update verification Failed:", verificationResult.message);
            return res.status(400).json({ message: `Problem validation failed: ${verificationResult.message}` });
        }
        console.log("Update verification successful.");
        
        // 2. If verification passes, update the problem
        // req.body contains all the fields sent from the frontend
        // { new: true } returns the updated document
        // { runValidators: true } ensures Mongoose schema rules are applied on update
        const updatedProblem = await Problem.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        console.log("Problem updated successfully in DB:", updatedProblem._id);
        res.status(200).json({ message: "Problem updated successfully!", problem: updatedProblem });

    } catch (err) {
        console.error(`Error in updateProblem controller for ID ${id}:`, err);
        res.status(500).json({ message: "An internal server error occurred.", error: err.message });
    }
};


// // Creating a problem
// const createProblem = async(req,res)=>{

//     let {title ,visibleTestCases , hiddenTestCases , startCode , referenceSolution} = req.body ;
//     try{
        
//         // checking the correctness of referenceSolution
//         for(const solution of referenceSolution)
//         {

//             // formate send to JUDGE0 
//             // source_code:
//             // language_id:
//             // stdin: 
//             // expected_output:
            
//             const languageId = getLanguageById(solution.language) ;

//             const submissions = visibleTestCases.map((testCases)=> ({
//                 language_id: languageId ,
//                 source_code: solution.completeCode ,
//                 stdin: testCases.input ,
//                 expected_output: testCases.output
//             })) ;

//             const submitResult = await submitBatch(submissions) ;

//             const resultToken = submitResult.map((value) => value.token) ;

//             const testResult = await submitToken(resultToken) ;

//             for(const test of testResult)
//             {
//                 if(test.status_id != 3) 
//                     return res.status(400).send("Error Occured") ;
//             }

//             // My code
//             // const isVerified = testResult.every((value) => value.status_is > 3) ;
//             // if(isVerified)
//             //     throw new Error("Error Occured") ;

//         }

//         // Now we can store the problem in our DB. problemCreater: req.result._id (chuki maine createProblem ko run krne se phle 'adminMiddleware' ko run kiya tha taki admin ko authenticate kiya ja ske wahi se us user ka info fetch kiya tha aur req.result me store kraya tha taki yha use kiya ja ske)
//         // problem.problemCreator = req.result._id ;
//         const problem = await Problem.create({...req.body , problemCreator: req.result._id}) ;       

//         res.status(201).send("Problem Saved Successfully") ;
//         console.log("Problem created") ;
//     } 
//     catch(err) 
//     {
//         res.status(400).send("Error : " + err) ;
//     }

// }

// // updating a problem
// const updateProblem = async (req,res)=>{

//     const {id} = req.params ;
//     const {title , description , difficulty , tags , visibleTestCases , hiddenTestCases , startCode , referenceSolution , problemCreater} = req.body ;

//     try{

//         if(!id)
//             return res.status(400).send("Missing Id Feild") ;

//         const DSAProblem = await Problem.findById(id) ;

//         if(!DSAProblem)
//             return res.status(404).send("Id is not present in server") ;

//         for(const {language , completeCode} of referenceSolution)
//         {
//             const languageId = getLanguageById(language) ;

//             const submissions = visibleTestCases.map((testCases)=> ({
//                 language_id: languageId ,
//                 source_code: completeCode ,
//                 stdin: testCases.input ,
//                 expected_output: testCases.output
//             })) ;

//             const submitResult = await submitBatch(submissions) ;

//             const resultToken = submitResult.map((value) => value.token) ;

//             const testResult = await submitToken(resultToken) ;
//             // console.log(testResult) ;


//             for(const test of testResult)
//             {
//                 if(test.status_id != 3) 
//                     return res.status(400).send("Error Occured") ;
//             }
//         }

//         const newProblem = await Problem.findByIdAndUpdate(id , {...req.body} , {runValidators: true , new: true}) ;

//         res.status(200).send(newProblem) ;

//     }
//     catch(err) 
//     {
//         res.status(500).send("Error : " + err) ;
//     }
// }


// deleting a problem
const deleteProblem = async(req,res)=>{

    const {id} = req.params ;

    try{

        if(!id)
            return res.status(400).send("Id is Missing") ;

        const deletedProblem = await Problem.findByIdAndDelete(id) ;

        if(!deletedProblem)
            return res.status(404).send("Problem is missing") ;

        res.status(200).send("Deleted Successfully") ;

    }
    catch(err)
    {
        res.status(400).send("Error : " + err) ;
    }
}


// get a problem by id
const getProblemById = async(req,res)=>{

    const {id} = req.params ;

    try{

        if(!id)
            return res.status(404).send("Id is missing") ;

        // Fetching a problem with some selected fields so that secret data never go to frontend. Below are two methods to achieve this.
        // const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases  startCode referenceSolution') ;

        let getProblem = await Problem.findById(id).select('-hiddenTestCases -__v') ;

        if(!getProblem)
            return res.status(404).send("Problem is Missing") ;

        res.status(200).send(getProblem) ;

    }
    catch(err)
    {
        res.status(400).send("Error : " + err) ;
    }
}

// get all problem
const getAllProblems = async(req,res)=>{

    try{
        // Pagination -> Dividing dataset into fixed size pages so that ek sath hi sare data ko fetch na krna pde aur na use ek sath show krna pde.
        // const getProblem = await Problem.find({}).skip().limit() ;
        const getProblem = await Problem.find({}).select('_id title difficulty tags') ;

        if(getProblem.length == 0)
            return res.status(404).send("Problem is Missing") ;
        
        res.status(200).send(getProblem) ;

    } 
    catch(err)
    {
        res.status(400).send("Error : " + err) ;
    }
}

const solvedAllProblemByUser = async(req,res)=>{

    try{
        const userId = req.result._id ;

        // populate({path: "" , select: " "}) -> given path pr jo stored reference hoga wha jayega aur uska stored sara info fetch krke lekr aayega. Jaise niche "problemSolved" path pr "problemId" stored hai jo ki ek reference hai. us reference par rakhi sari info ko "problemSolved" wale field me store krega.
        const user = await User.findById(userId).populate({
            path: "problemSolved" ,
            select: "_id title difficulty tags"
        })

         const stats = {
            total: user.problemSolved.length,
            easy: user.problemSolved.filter(p => p.difficulty === 'easy').length,
            medium: user.problemSolved.filter(p => p.difficulty === 'medium').length,
            hard: user.problemSolved.filter(p => p.difficulty === 'hard').length,
        };
        
        res.json({
            user: {
                _id: user._id,
                name: user.firstName,
                emailId: user.emailId,
                profilePicUrl: user.profilePicUrl
            },
            stats,
            solvedProblems: user.problemSolved,
        });
    }
    catch(err)
    {
        res.status(500).send("Error : " + err) ;
    }

}

const submittedProblem = async(req,res)=>{

    try
    {
        const userId = req.result._id ;
        const problemId = req.params.id ;

        const ans = await Submission.find({userId , problemId}).sort({createdAt: -1}) ;

        if(ans.length == 0)
            return res.status(200).send("No Submission") ;

        res.status(200).send(ans) ;
    }
    catch(err)
    {
        res.status(500).send("Error : " + err) ;
    }

}

module.exports = {createProblem , updateProblem , deleteProblem , getProblemById , getAllProblems , solvedAllProblemByUser , submittedProblem} ;



