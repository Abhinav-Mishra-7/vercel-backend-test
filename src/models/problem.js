const mongoose = require("mongoose") ;
const { applyTimestamps, base } = require("./user");
const {Schema} = mongoose ;

const problemSchema = new Schema({

    title:{
        type: String ,
        required: true ,
    },
    description:{
        type: String ,
        required: true
    } ,
    constraints: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true ,
        enum: ['easy' , 'medium' , 'hard'] ,
    } ,
    tags:{
        type: String ,
        enum: ['array' , 'dp' , 'linked list' , 'graph' , 'tree'] ,
        required: true 
    },
    functionName: {
        type: String,
        required: true,
        trim: true
    },
    visibleTestCases: [
        {
            input: {
                type: String ,
                // required: true ,
            } ,
            output: {
                type: String ,
                // required: true ,
            } ,
            explaination: {
                type: String ,
                // required: true
            }

        }
    ] ,

    hiddenTestCases: [
        {
            input: {
                type: String ,
                // required: true ,
            } ,
            output: {
                type: String ,
                // required: true ,
            }
        }
    ] ,

    startCode: [
        {
            language: {
                type: String ,
                required: true
            } ,
            initialCode: {
                type: String ,
                required: true
            }
        }
    ] ,

    referenceSolution: [
        {
            language: {
                type: String ,
                required: true
            } , 
            completeCode: {
                type: String ,
                required: true
            }
        }
    ] ,

    problemCreator: {
        // Schema.Types.ObjectId -> Ye user ke id ko refer kar rha hai
        type: Schema.Types.ObjectId ,
        ref: 'user' ,
    }
} , {timestamps : true})


const Problem = mongoose.model('problem' , problemSchema) ;

module.exports = Problem ;

