const User = require("../models/user") ;
const redisClient = require("../config/redis");
const validate = require("../utils/validator") ;
const bcrypt = require("bcrypt") ;
const jwt = require("jsonwebtoken") ;
const Submission = require("../models/submission") ;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Problem = require("../models/problem") ;
 
// register
const register = async(req,res)=>{

    try{

        // Validate for valid emailId and password using validator
        validate(req.body) ;

        const firstName = req.body.firstName ;
        const emailId = req.body.emailId ;
        const password = req.body.password ;

        // I can check that is the new emailId existing or not . There is no need for that becoz "create" function throw error if there already exit emailId kyuki maine emailId ko unique mark kr rkha hai
        // const ans = User.exists(req.body.emailId) ;
        // if(ans)
        //     throw new Error("Dikkat hai");

        // ecrypting password to store in DB
        req.body.password = await bcrypt.hash(password , 10) ;
        req.body.role = "user" ;

        
        // creating new document in DB
        let user = await User.create(req.body) ;
    
        // // creating jwt
        // const token = jwt.sign({_id: user._id , emailId: emailId , role: "user"} , process.env.JWT_KEY , {expiresIn: 60*60}) ;  
        
        // // Storing cookie
        // // if(user.verified)
        // res.cookie('token' , token , {maxAge: 60*60*1000}) ;

        // const reply = {
        //     user: user.select('firstName emailId _id problemSolved')
        // }
        const reply = {
            firstName: user.firstName ,
            emailId: user.emailId ,
            _id: user._id, 
            role: user.role ,
            verified: user.verified
        }


        // Sending some info about user so that do not need to call DB twice for user info
        res.status(201).json({
            user: reply ,
            message: "Registered Successfully"
        })

    }
    catch(err){
        res.status(400).send("Error: " + err) ;
    }
}
  
// login
const login = async(req,res)=>{
       
    try{
        
        const emailId = req.body.emailId ;
        const password = req.body.password ;

        if(!emailId)
            throw new Error("Invalid Credentials") ;
        if(!password)
            throw new Error("Invalid Credentials") ;


        const user = await User.findOne({emailId}) ;

        if(!user)
            return res.send("User doesn't exist") ;

        const match = await bcrypt.compare(password , user.password) ;

        if(!match)
            throw new Error("Invalid Credentials") ;

        // creating jwt
        const token = jwt.sign({_id: user._id , emailId: emailId , role: user.role} , process.env.JWT_KEY , {expiresIn: 3600*24}) ;  

        const reply = {
            firstName: user.firstName ,
            emailId: user.emailId ,
            _id: user._id,
            role: user.role ,
            verified: user.verified
        }
        
        // Storing cookie
        res.cookie('token' , token , {maxAge: 24*60*60*1000}) ;

        res.status(201).json({
            user: reply ,
            message: "Logged in Successfully"
        })
    }
    catch(err){
        res.status(401).send("Error: " + err) ;
    }
}

// Logout 
const logout = async(req,res)=>{
    try{

        // Validate the token -> validated in "userAuth.js" file using a middleware "userMiddleware"

        // extracting token from the cookies
        const {token} = req.cookies ;
        const payload = jwt.decode(token) ; 
        
        // Add token in blocklist
        await redisClient.set(`token: ${token}` , "Blocked") ;

        // Adding expiry date for the token
        await redisClient.expireAt(`token: ${token}` , payload.exp) ;
        
 
        // Clear cookie
        res.cookie("token" , null ,{expires: new Date(Date.now())} ) ; 

        res.send("Logged Out Successfully") ; 

    }
    catch(err){
        res.status(503).send("Error: " + err) ;
    }
}

// admin register
const adminRegister = async(req,res)=>{

    try{

        // Validate for valid emailId and password using validator
        validate(req.body) ;

        const firstName = req.body.firstName ;
        const emailId = req.body.emailId ;
        const password = req.body.password ;

        // I can check that is the new emailId existing or not . There is no need for that becoz "create" function throw error if there already exit emailId kyuki maine emailId ko unique mark kr rkha hai
        // const ans = User.exists(req.body.emailId) ;

        // ecryptinh password to store in DB
        req.body.password = await bcrypt.hash(password , 10) ;
        req.body.role = 'admin' ;

        // creating new document in DB
        const user = await User.create(req.body) ;

        // creating jwt
        const token = jwt.sign({_id: user._id , emailId: emailId , role: "admin"} , process.env.JWT_KEY , {expiresIn: 3600}) ;  
        
        // Storing cookie
        res.cookie('token' , token , {maxAge: 60*60*1000}) ;
 
        res.status(201).send("User Registered Successfully") ;

    }
    catch(err){
        res.status(400).send("Error: " + err) ;
    }
}

const deleteProfile = async(req,res)=>{

    try{
        const userId = req.result._id ;

        // Deleting from userSchema
        await User.findByIdAndDelete(userId) ;

        // Deleting from submission
        // await User.findByIdAndDelete(userId) ;

        await Submission.deleteMany({userId}) ;

        res.status(200).send("Deleted Successfully") ;
    }
    catch(err)
    {
        res.status(500).send("Error : " + err) ;
    }

}

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        // console.log(token) ;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { given_name, family_name, email } = payload;

        let user = await User.findOne({ emailId: email });

        // console.log(user) ;

        if (!user) {
            // Generate random password for Google users
            const randomPassword = require('crypto').randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await User.create({
                firstName: given_name,
                lastName: family_name || '',
                emailId: email,
                password: hashedPassword,
                verified: true,  // Google-verified emails don't need OTP
            });
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 3600 }
        );

        res.cookie('token', jwtToken, { maxAge: 60 * 60 * 1000 });
        
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            verified: user.verified
        };

        res.status(200).json({
            user: reply,
            message: 'Google authentication successful'
        });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

const getAllUsers = async(req,res) =>{
    try{

        const user = await User.find({}).select('firstName role') ;

        if(!user)
            throw new Error("User doesn't exist") ;

        res.status(200).send(user) ;

    }catch(err)
    {
        res.status(500).send("Error : " + err) ;
    }
}

const getUserData = async(req,res) => {
    try{

        const userId = req.result._id ;

        if(!userId)
            return res.status(401).send("Unauthorised user") ;

        const user = await User.findById(userId) ;
        res.status(200).send(user) ;

    }
    catch(err){
        res.status(500).send("Error : " + err) ;
    }
}

const updateUserProfile = async(req,res) =>{
    try{

        const userId = req.result._id ;
        const updates = req.body ;

        console.log(updates) ;

        if(!userId)
            return res.status(401).send("Unauthorised user") ;

        const user = await User.findById(userId) ;

        user.firstName = updates.firstName ;
        user.lastName = updates.lastName ;

        user.save() ;

        res.status(200).send("Updated Successfully") ;

    }
    catch(err)
    {
        res.status(401).send("Error : " + err) ;
    }
}

const getMe = async (req, res) => {
  try {

    const userId = req.result._id ;
    
    if(!userId)
        return res.status(401).send("Unauthorized Access") ;

    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// User premium status
const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.result.id; // From userMiddleware
        const user = await User.findById(userId).select('isPremium premiumUntil');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            isPremium: user.isPremium,
            premiumUntil: user.premiumUntil,
        });

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ message: 'Server error while fetching status.' });
    }
};

const toggleWishlistProblem = async (req, res) => {
  const { problemId } = req.body;
  const userId = req.result._id;

  if (!problemId) {
    return res.status(400).json({ message: 'Problem ID is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const problemExists = await Problem.findById(problemId);
    if (!problemExists) {
        return res.status(404).json({ message: 'Problem not found' });
    }

    const index = user.wishlist.indexOf(problemId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(problemId);
    }

    await user.save();
    res.status(200).json({
      message: 'Wishlist updated successfully',
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getWishlistProblems = async (req, res) => {
  const userId = req.result._id;
  try {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      model: 'problem', // Ensure this matches your Problem model name
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {register, login , logout , adminRegister , deleteProfile , googleLogin , getAllUsers , getSubscriptionStatus , updateUserProfile , getUserData , getMe , toggleWishlistProblem , getWishlistProblems} ;  