const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'solutionvideo',
        required: true
    },
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
   },
   title: {
    type: String
   }, 
   cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  description: {
    type: String
  }
},{
    timestamps:true
});

// To easily get the like count
videoSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

// Add a compound index to ensure a user can only upload one video per problem
videoSchema.index({ problemId: 1, userId: 1 }, { unique: true });

const SolutionVideo = mongoose.model("solutionVideo",videoSchema);

module.exports = SolutionVideo;
