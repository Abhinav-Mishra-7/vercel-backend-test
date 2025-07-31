const mongoose = require("mongoose") ;

async function main()
{
    try {
        console.log("VERCEL SERVER IS ATTEMPTING TO CONNECT WITH URI:", process.env.DB_CONNECT_STRING);
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log("DB Connected");
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED:", error);
        process.exit(1); 
    }
} 

module.exports =  main ; 