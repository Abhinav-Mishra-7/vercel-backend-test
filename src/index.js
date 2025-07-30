const express = require('express');
const app = express();
require("dotenv").config() ;
const main = require("./config/db") ;
const redisClient = require("./config/redis");

// parallely calling two function to connent DB and redis both at the same time
const initializeConnection = async ()=>{

    try{
        await Promise.all([main() , redisClient.connect()]) ;
        console.log("DB Connected") ;
        const PORT = process.env.PORT;
        server.listen(PORT, () => {
            console.log(`Server listening at http://localhost:${PORT}`);
        });
    }
    catch(err)
    {
        console.log("Error : " + err) ;
    }
}
initializeConnection() ;


const cookieParser = require("cookie-parser") ;
const cors = require("cors") ;

const authRouter = require("./routes/userAuth") ;
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting") ;
const emailRouter = require("./routes/emailVerify") ;
const videoRouter = require("./routes/videoCreator") ;
const contestRouter = require("./routes/contestRoute") ;
const paymentRouter = require("./routes/paymentRoutes") ;
const commentRoutes = require("./routes/commentRoutes") ;
const imageRouter = require("./routes/userImage") ;
const http = require('http');
const {initSocket} = require("./config/socketManager") ;

// This log will appear the moment the server file is loaded by Vercel
console.log('Server file has been loaded by Vercel.');

app.get('/', (req, res) => {
  // This log will appear only if a request successfully reaches this route
  console.log("Request successfully received for root route '/'.");
  res.status(200).send('<h1>Success! Your minimal backend is running on Vercel.</h1>');
});

app.get('/api/test', (req, res) => {
  // A second route for testing
  console.log("Request successfully received for '/api/test' route.");
  res.status(200).json({ message: 'The test API route is working!' });
});

// Adding CORS to handle cross platform problem
app.use(cors({
    origin: " http://localhost:5173" ,
    credentials: true
}))

// Using socket to handle the real time changes
const server = http.createServer(app);
const io = initSocket(server);
app.set('socketio' , io) ;


// Parsing the cookie and json format data coming from frontend
app.use(express.json()) ;
app.use(cookieParser()) ;

// Dealing with Routes
// Register , login , logout , adminRegister , deleteProfile
app.use("/user" , authRouter) ;
// create , update , delete , getProblem , getAllProblem 
app.use("/problem" , problemRouter) ; 
// runCode , submitCode
app.use("/submission" , submitRouter) ;
// AI chat bot
app.use('/ai' , aiRouter) ;
// email verification
app.use('/api' , emailRouter) ;
// Video creator
app.use('/video' , videoRouter) ;
// Comment
app.use("/comment" , commentRoutes) ;
// contest router
app.use("/contest" , contestRouter) ;
// payment route
app.use("/payments" , paymentRouter) ;
// profile image
app.use("/image" , imageRouter) ;

module.exports = app ;
