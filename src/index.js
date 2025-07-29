const express = require('express');
const app = express();
require("dotenv").config() ;
const main = require("./config/db") ;
const redisClient = require("./config/redis");
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

const PORT = process.env.PORT || 5000;

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

// Parsing the cookie and json format data coming from frontend
app.use(express.json()) ;
app.use(cookieParser()) ;

// Using socket to handle the real time changes
const server = http.createServer(app);
const io = initSocket(server);
app.set('socketio' , io) ;

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

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. This log will NOT appear on Vercel.`);
});
