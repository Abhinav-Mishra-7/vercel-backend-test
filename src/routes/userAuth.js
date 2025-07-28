const express = require("express") ;

// Creating Router for user authentication so that "index" file does not become messy
const authRouter = express.Router() ;

const {register , login , logout , adminRegister , deleteProfile , googleLogin , getAllUsers , getSubscriptionStatus , updateUserProfile , getUserData , toggleWishlistProblem , getWishlistProblems} = require("../controllers/userAuthenticate") ;
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware") ;


// Register
authRouter.post("/register" , register) ;
// login 
authRouter.post("/login" , login) ;
// logout
authRouter.post("/logout" , userMiddleware , logout) ;
// admin Register
authRouter.post("/admin/register" , adminMiddleware , adminRegister) ;
// Delete profile
authRouter.delete('/deleteProfile' , userMiddleware , deleteProfile) ;
// Google authentication
authRouter.post('/google' , googleLogin) ;

authRouter.get('/subscription-status' , userMiddleware , getSubscriptionStatus)

authRouter.get("/check" , userMiddleware , (req,res)=>{

    try
    {      
        const reply = {
            firstName: req.result.firstName ,
            emailId: req.result.emailId ,
            _id: req.result._id,
            role: req.result.role,
            verified: req.result.verified ,
            profilePicUrl: req.result.profilePicUrl
        }

        res.status(200).json({
            user: reply ,
            message: "Valid User"
        })
    }
    catch(err)
    {
        res.status(500).send("Error : " + err) ;
    }

})

authRouter.get("/getAllUsers" , userMiddleware , getAllUsers) ;

authRouter.put("/update-profile" , userMiddleware , updateUserProfile) ;

authRouter.get('/get-user-data' , userMiddleware , getUserData) ;

authRouter.post('/wishlist/toggle' , userMiddleware , toggleWishlistProblem) ;

authRouter.get('/wishlist' , userMiddleware , getWishlistProblems) ;

module.exports = authRouter ;


