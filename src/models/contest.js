const mongoose = require("mongoose");
const { Schema } = mongoose;

const participantProblemStatSchema = new Schema({
  problem: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
  isSolved: { type: Boolean, default: false },
  solveTime: { type: Number }, // Time from contest start in seconds
  wrongSubmissions: { type: Number, default: 0 }
}, { _id: false });

const participantSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  score: { type: Number, default: 0 },
  penalty: { type: Number, default: 0 }, // Total penalty time in seconds
  solvedProblems: [{ type: Schema.Types.ObjectId, ref: 'problem' }],
  problemStats: [participantProblemStatSchema]
}, { _id: false });

const contestSchema = new Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  problems: [{
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  participants: [participantSchema],
  leaderboard: [{
    rank: Number,
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    score: Number,
    penalty: Number,
    solvedProblems: [{ type: Schema.Types.ObjectId, ref: 'problem' }],
    problemStats: [{
      problem: { type: Schema.Types.ObjectId, ref: 'problem' },
      isSolved: Boolean,
      solveTime: Number,
      wrongSubmissions: Number
    }]
  }]
}, { timestamps: true , strictPopulate: false });


contestSchema.index({'participants.user': 1,'participants.problemStats.problem': 1});


const Contest = mongoose.model('contest', contestSchema);

module.exports = Contest;






// // models/contestModel.js
// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const participantSchema = new Schema({
//     user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
//     score: { type: Number, default: 0 },
//     // Total penalty time in seconds. Calculated as (time of correct submission) + (20 minutes * num wrong attempts)
//     penalty: { type: Number, default: 0 }, 
//     problemStats: [{
//         problem: { type: Schema.Types.ObjectId, ref: 'problem' },
//         isSolved: { type: Boolean, default: false },
//         solveTime: { type: Number }, // Time from contest start in seconds
//         wrongSubmissions: { type: Number, default: 0 }
//     }]
// });

// const contestSchema = new Schema({
//     title: { type: String, required: true, unique: true },
//     description: { type: String, required: true },
//     startTime: { type: Date, required: true },
//     duration: { type: Number, required: true }, // in minutes
//     problems: [{
//         type: Schema.Types.ObjectId,
//         ref: 'problem',
//         required: true
//     }],
//     createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
//     registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
//     participants: [participantSchema],
//     // The final leaderboard is generated and stored here after the contest ends.
//     leaderboard: [{
//         rank: Number,
//         user: { type: Schema.Types.ObjectId, ref: 'user' },
//         score: Number,
//         penalty: Number,
//         problemStats: [{
//             problem: { type: Schema.Types.ObjectId, ref: 'problem' },
//             solveTime: Number,
//         }]
//     }]
// }, { timestamps: true });

// const Contest = mongoose.model('contest', contestSchema);

// module.exports = Contest;