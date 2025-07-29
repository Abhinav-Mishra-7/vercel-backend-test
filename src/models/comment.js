const mongoose = require("mongoose") ;
const {Schema} = mongoose ;

const commentSchema = new Schema({
    solutionVideo: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user', // Assuming you have a User model
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    // For handling replies. If null, it's a top-level comment.
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'comment',
        default: null,
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
    }],
}, { timestamps: true });

// Virtual for upvote count
commentSchema.virtual('upvoteCount').get(function() {
    return this.upvotes.length;
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });


const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment ;