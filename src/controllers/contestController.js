const Contest = require("../models/contest");
const User = require("../models/user"); 
const mongoose = require("mongoose") ;

// Admin: Create a new contest
const createContest = async (req, res) => {
  try {
    const { title, description, startTime, duration, problems } = req.body;
    const createdBy = req.result._id;

    const newContest = new Contest({
      title, 
      description, 
      startTime: new Date(startTime),
      duration, 
      problems,
      createdBy
    });
    
    const savedContest = await newContest.save();

    res.status(201).json({
      message: "Contest created successfully!",
      contest: savedContest
    });

  } catch (error) {
    console.error("Error creating contest:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "A contest with this title already exists." });
    }
    res.status(500).json({ message: "Server error while creating contest." });
  }
};

// Public: Get all contests
const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find({})
      .sort({ startTime: -1 })
      .select("title startTime duration registeredUsers problems");

    res.status(200).json(contests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Server error while fetching contests." });
  }
};


// Helper function to determine contest status
const getContestStatus = (contest) => {
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(startTime.getTime() + contest.duration * 60000);

  if (now < startTime) return 'Upcoming';
  if (now >= startTime && now < endTime) return 'Live';
  return 'Ended';
};

// Public/User: Get details of a single contest
// const getContestDetails = async (req, res) => {
//   try {
//     const contestId = req.params.id;
//     const userId = req.result._id;

//     console.log(userId) ;

//     // 1. Lightweight check to see if the user is registered
//     const contestForCheck = await Contest.findById(contestId).select('registeredUsers');

//     if (!contestForCheck) {
//       return res.status(404).json({ message: "Contest not found." });
//     }

//     const isRegistered = contestForCheck.registeredUsers.some(regUserId => regUserId.equals(userId));

//     // 2. LOGIC BRANCH: Based on registration status
//     if (isRegistered) {
//       // --- USER IS REGISTERED: Fetch full data in parallel ---

//       // Query A: Gets the main contest data, problem list, and leaderboard
//       const mainContestQuery = Contest.findById(contestId)
//         .select('-participants.problemStats') // Exclude all problemStats to keep this query light
//         .populate({
//           path: 'problems',
//           select: 'title difficulty tags' // General problem info
//         })
//         .populate({
//           path: 'participants',
//           populate: {
//             path: 'user',
//             select: 'username name' // Public user info for leaderboard
//           }
//         });

//       // Query B: Gets ONLY the current user's participant data and deeply populates it
//       const userStatsQuery = Contest.findOne(
//         { _id: contestId, 'participants.user': userId }, // Find the contest and the specific participant
//         { 'participants.$': 1, _id: 0 } // Project ONLY the matching participant sub-document
//       ).populate({
//         path: 'participants.problemStats.problem', // The deep path we need
//         select: 'title difficulty' // Populate with these specific fields
//       });

//       // Run both queries at the same time for efficiency
//       const [contest, userStatsData] = await Promise.all([mainContestQuery, userStatsQuery]);

//       // Extract the user's specific stats from the second query's result
//       const userStats = userStatsData?.participants[0];

//       console.log(userStats) ;

//       res.status(200).json({
//         isRegistered: true,
//         contest: contest,   // Contains leaderboard, problem list, etc.
//         userStats: userStats  // Contains the user's personal progress with populated problems
//       });

//     } else {
//       // --- USER IS NOT REGISTERED: Fetch only public data ---
//       const publicContest = await Contest.findById(contestId)
//         .select('title description startTime endTime');

//       res.status(200).json({
//         isRegistered: false,
//         contest: publicContest
//       });
//     }

//   } catch (error) {
//     console.error("Error fetching contest details:", error);
//     res.status(500).json({ message: "Server error while fetching contest details." });
//   }
// };
// Public/User: Get details of a single contest
const getContestDetails = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.result?._id; 

    // 1. Fetch the base contest data including the full, populated problems list.
    // We use .lean() for performance since we will be modifying the object.
    const contest = await Contest.findById(contestId)
      .populate({
        path: 'problems',
        select: 'title difficulty tags' // Ensure problems are fully populated
      })
      .lean(); // .lean() returns a plain JavaScript object, faster and easier to modify.

    if (!contest) {
      return res.status(404).json({ message: "Contest not found." });
    }

    const isRegistered = userId ? contest.registeredUsers.some(regUserId => regUserId.equals(userId)) : false;
    const contestStatus = getContestStatus(contest);

    // 2. LOGIC BRANCH: Based on registration and contest status
    if (isRegistered) {
      // --- USER IS REGISTERED: Dynamically build their stats ---

      // Find the user's specific participant sub-document from the lean contest object.
      const userParticipantData = contest.participants.find(p => p.user.equals(userId));

      if (userParticipantData) {
        // *** THE CORE FIX IS HERE ***
        // We will create a fresh, complete `problemStats` array.

        // a. Create a Map of existing stats for fast lookups.
        const existingStatsMap = new Map();
        if (userParticipantData.problemStats) {
          userParticipantData.problemStats.forEach(stat => {
            // Key by problem ID string
            existingStatsMap.set(stat.problem.toString(), stat);
          });
        }

        // b. Iterate over the master `contest.problems` list (the single source of truth).
        const finalProblemStats = contest.problems.map(problem => {
          const problemIdStr = problem._id.toString();

          // c. Check if the user has existing stats for this problem.
          if (existingStatsMap.has(problemIdStr)) {
            const existingStat = existingStatsMap.get(problemIdStr);
            // Return the existing stat, but ensure the `problem` field is the fully populated object.
            return {
              ...existingStat,
              problem: problem 
            };
          } else {
            // d. If no stats exist (it's a newly added problem), create a default entry.
            return {
              problem: problem, // The `problem` is the full object from the master list
              isSolved: false,
              solveTime: null,
              wrongSubmissions: 0
            };
          }
        });

        // e. Replace the (potentially stale) problemStats with our fresh, complete list.
        userParticipantData.problemStats = finalProblemStats;
        contest.userStats = userParticipantData;
      }
      
      // Remove the full participants list before sending to client to avoid leaking data.
      delete contest.participants;

      res.status(200).json({
        isRegistered: true,
        status: contestStatus,
        contest: contest // `contest` now contains the corrected `userStats`
      });

      console.log(contest);

    } else {
      // --- USER IS NOT REGISTERED ---
      if (contestStatus === 'Upcoming') {
        // For upcoming contests, we don't need participant data.
        delete contest.participants;
        res.status(200).json({
          isRegistered: false,
          status: contestStatus,
          contest: contest
        });
      } else {
        // For 'Live' or 'Ended' contests, non-registered users missed it.
        return res.status(403).json({ 
            message: "You are not registered for this contest and it has already started or ended.",
            missed: true 
        });
      }
    }
  } catch (error) {
    console.error("Error fetching contest details:", error);
    res.status(500).json({ message: "Server error while fetching contest details." });
  }
};


// Authenticated User: Register for a contest
// const registerForContest = async (req, res) => {
//   try {
//     const contestId = req.params.id;
//     const userId = req.result._id;

//     const contest = await Contest.findById(contestId);

//     if (!contest) {
//       return res.status(404).json({ message: "Contest not found." });
//     }

//     const now = new Date();
//     if (now > new Date(contest.startTime)) {
//       return res.status(403).json({ message: "Cannot register, the contest has already started."});
//     }
//     else if (contest.registeredUsers.some(registeredId => registeredId.equals(userId))) {
//       return res.status(409).json({ message: "You are already registered for this contest."});
//     }

//     // Add to registered users
//     contest.registeredUsers.push(userId);    
//     // Create participant entry
//     const participant = {
//         user: userId,
//         score: 0,
//         penalty: 0,
//         solvedProblems: [],
//         problemStats: contest.problems.map(problemId => ({
//           problem: problemId,
//           isSolved: false,
//           solveTime: null,
//           wrongSubmissions: 0
//         }))
//     };
      
//     contest.participants.push(participant);
//     await contest.save();

//     res.status(200).json({ message: "You have registered successfully" , registered: false });
//   } catch (error) {
//     console.error("Error registering for contest:", error);
//     res.status(500).json({ message: error });
//   }
// };
const registerForContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.result._id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found." });
    }

    const now = new Date();
    if (now > new Date(contest.startTime)) {
      return res.status(403).json({ message: "Cannot register, the contest has already started."});
    }
    
    if (contest.registeredUsers.some(registeredId => registeredId.equals(userId))) {
      return res.status(409).json({ message: "You are already registered for this contest."});
    }

    contest.registeredUsers.push(userId);    
    
    const participant = {
        user: userId,
        score: 0,
        penalty: 0,
        problemStats: contest.problems.map(problemId => ({
          problem: problemId,
          isSolved: false,
          solveTime: null,
          wrongSubmissions: 0
        }))
    };
      
    contest.participants.push(participant);
    await contest.save();

    // Cleaned up response for clarity
    res.status(200).json({ message: "You have registered successfully!" });
  } catch (error) {
    console.error("Error registering for contest:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Public: Get leaderboard for a finished contest
const getLeaderboard = async (req, res) => {
  try {
    const contestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return res.status(400).json({ message: "Invalid contest ID" });
    }

    const contest = await Contest.findById(contestId)
      .populate({
        path: 'leaderboard.user',
        select: 'firstName emailId'
      })
      .populate({
        path: 'leaderboard.problemStats.problem',
        select: 'title'
      })
      .populate('problems', 'title');

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Filter participants who have attempted at least one problem
    const activeParticipants = contest.participants.filter(participant => {
      return participant.problemStats.some(ps => 
        ps.wrongSubmissions > 0 || ps.isSolved
      );
    });

    // Generate leaderboard only if not already generated or needs update
    if (!contest.leaderboard || contest.leaderboard.length === 0) {
      contest.leaderboard = activeParticipants
        .map(p => ({
          user: p.user,
          score: p.score,
          penalty: p.penalty,
          solvedProblems: p.solvedProblems,
          problemStats: p.problemStats
        }))
        .sort((a, b) => {
          // Sort by score (desc) then penalty (asc)
          if (b.score !== a.score) return b.score - a.score;
          return a.penalty - b.penalty;
        })
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
      
      await contest.save();
      
      // Refetch to get populated data
      const updatedContest = await Contest.findById(contestId)
        .populate({
          path: 'leaderboard.user',
          select: 'username email'
        })
        .populate({
          path: 'leaderboard.problemStats.problem',
          select: 'title'
        })
        .populate('problems', 'title');
      
      return res.status(200).json(updatedContest);
    }

    res.status(200).json(contest);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ 
      message: "Server error fetching leaderboard",
      error: error.message
    });
  }
};

module.exports = {
  createContest,
  getAllContests,
  getContestDetails,
  registerForContest,
  getLeaderboard
};









// const getContestDetails = async (req, res) => {
//   try {
//     const contest = await Contest.findById(req.params.id)
//     .populate("problems") // Populate the problems array
//     .populate("participants.user"); // Also populate participants

//     const userId = req.result._id ;

//     if (!contest) {
//       return res.status(404).json({ message: "Contest not found." });
//     }

//     let participants = contest.participants ;
//     let userData = {} ;

//     for(let i = 0 ;  i < participants.length ; i++)
//     {     
//       if(userId.toString() == participants[i].user._id.toString())
//       {
//         console.log("Here") ;
//         userData = participants[i] ;
//         break ;
//       }
//     }
//     let problemStats = userData.problemStats ;
//     problemStats = await problemStats.populate({
//       path: "problem" ,
//       select: "title"
//     })

//     console.log(userData) ;
//     res.status(200).json({contest , userData});
//   } catch (error) {
//     console.error("Error fetching contest details:", error);
//     res.status(500).json({ message: "Server error while fetching contest details." });
//   }
// };
// const getContestDetails = async (req, res) => {
//   try {
//     const contest = await Contest.findById(req.params.id)
//       .populate("problems")
//       .populate({
//         path: "participants.user",
//         select: "_id username" // Only get necessary user fields
//       })
//       .populate({
//         path: "participants.problemStats.problem",
//         select: "title", // Only get the title field
//         model: "problem"
//       });

//     const userId = req.result._id;
    
//     // console.log(userId) ;
//     // console.log(contest.registeredUsers[0]);
//     // if(contest.registeredUsers.includes(userId)) ;
//     // console.log("Yes") ;

//     if (!contest) {
//       return res.status(404).json({ message: "Contest not found." });
//     }

//     let userData = {};
//     for (let i = 0; i < contest.participants.length; i++) {
//       const participant = contest.participants[i];
//       if (participant.user && userId.toString() === participant.user._id.toString()) {
//         userData = {
//           user : participant.user ,
//           problemStats: participant.problemStats.map(stat => ({
//             ...stat.toObject({ virtuals: true }),
//             problem: {
//               _id: stat.populate({path: 'problem' , select: '_id'}) ,
//               title: stat.populate({path: 'problem' , select: 'title'}) // Only include title
//             }
//           }))
//         };
//         break;
//       }
//       else
//       {
//         userData.registerForContest = false ;
//         break ;
//       }
//     }

//     console.log(userData) ;

//     res.status(200).json({ contest, userData });
//   } catch (error) {
//     console.error("Error fetching contest details:", error);
//     res.status(500).json({ message: "Server error while fetching contest details." });
//   }
// };

// const Contest = require("../models/contest");
// const User = require("../models/user"); 


// // Admin: Create a new contest
// const createContest = async (req, res) => {
//     console.log(req.body) ;
//     try {
//         const { title, description, startTime, duration, problems } = req.body;
        
//         const createdBy = req.result._id;

//         const newContest = new Contest({title,description,startTime,duration,problems,createdBy});
//         const savedContest = await newContest.save();

//         res.status(201).json({
//             message: "Contest created successfully!",
//             contest: savedContest
//         });

//     } catch (error) {
//         console.error("Error creating contest:", error);
//         if (error.code === 11000) {
//              return res.status(409).json({ message: "A contest with this title already exists." });
//         }
//         res.status(500).json({ message: "Server error while creating contest." });
//     }
// };

// // Public: Get all contests
// const getAllContests = async (req, res) => {
//     try {
//         const contests = await Contest.find({})
//             .sort({ startTime: -1 }) // Show newest first
//             .select("title startTime duration"); // Only send essential data for the list view

//         res.status(200).json(contests);
//     } catch (error) {
//         console.error("Error fetching contests:", error);
//         res.status(500).json({ message: "Server error while fetching contests." });
//     }
// };

// // Public/User: Get details of a single contest
// const getContestDetails = async (req, res) => {
//     try {
//         const contest = await Contest.findById(req.params.id)
//             .populate("problems", "title difficulty")
//             .populate("registeredUsers", "username"); // Populate usernames for count/display

//         if (!contest) {
//             return res.status(404).json({ message: "Contest not found." });
//         }

//         res.status(200).json(contest);
//     } catch (error) {
//         console.error("Error fetching contest details:", error);
//         res.status(500).json({ message: "Server error while fetching contest details." });
//     }
// };

// // Authenticated User: Register for a contest
// const registerForContest = async (req, res) => {
//     try {
//         const contestId = req.params.id;
//         const userId = req.user._id; // from auth middleware

//         const contest = await Contest.findById(contestId);

//         if (!contest) {
//             return res.status(404).json({ message: "Contest not found." });
//         }

//         if (new Date() > new Date(contest.startTime)) {
//             return res.status(400).json({ message: "Cannot register, the contest has already started." });
//         }

//         if (contest.registeredUsers.includes(userId)) {
//             return res.status(409).json({ message: "You are already registered for this contest." });
//         }

//         contest.registeredUsers.push(userId);
//         await contest.save();

//         res.status(200).json({ message: "Successfully registered for the contest!" });
//     } catch (error) {
//         console.error("Error registering for contest:", error);
//         res.status(500).json({ message: "Server error while registering." });
//     }
// };


// // Public: Get leaderboard for a finished contest
// const getLeaderboard = async (req, res) => {
//     try {
//         const contest = await Contest.findById(req.params.id)
//             .populate({
//                 path: 'leaderboard.user',
//                 select: 'username' // or whatever fields you want to show
//             })
//             .populate('problems', 'title');

//         if (!contest) {
//             return res.status(404).json({ message: "Contest not found." });
//         }

//         // Optional: Add logic to generate leaderboard on-the-fly if it's not saved
//         // For now, we assume it's generated and saved after the contest ends.

//         res.status(200).json({
//             title: contest.title,
//             leaderboard: contest.leaderboard,
//             problems: contest.problems,
//         });
//     } catch (error) {
//         console.error("Error fetching leaderboard:", error);
//         res.status(500).json({ message: "Server error while fetching leaderboard." });
//     }
// };


// module.exports = {createContest , getAllContests , getContestDetails , registerForContest , getLeaderboard} ;