const mongoose = require("mongoose") ;
const {Schema} = mongoose ;

const userSchema = new Schema({
    firstName: {
        type:String,
        required: true,
        minLength: 3 ,
        maxLength: 20
    },
    lastName: {
        type: String ,
        minLength: 3 ,
        maxLength: 20 
    } ,
    emailId: {
        type: String ,
        required: true ,
        unique: true ,
        trim: true ,
        lowercase: true ,
        immutable: true
    },
    age: {
        type: Number ,
        min: 6 ,
        max: 80 , 
    },
    role: { 
        type: String ,
        enum: ['user' , 'admin'] ,
        default: 'user'
    } ,
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId ,
            ref: 'problem' 
        }] ,
        unique: true 
    } ,
    password: {
        type: String ,
        required: true 
    } ,
    verified:{
        type: Boolean ,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    premiumUntil: {
        type: Date,
        default: null,
    } ,
     profilePicUrl: {
        type: String,
        default: null
    }, 
    profilePicPublicId: {
        type: String,
        default: null
    },
    wishlist: [{ 
    type: Schema.Types.ObjectId,
    ref: 'problem' // Assumes your problem model is named 'Problem'
  }]
},{
    timestamps: true
})

const User = mongoose.model("user" , userSchema) ;

module.exports = User ; 

