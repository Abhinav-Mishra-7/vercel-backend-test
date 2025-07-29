const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Contest = require("../models/contest") ;
const { buildHarness } = require('../utils/harness_builder');


const submitCode = async (req, res) => {
    try {
        const { id: problemId } = req.params ; 
        const { code, language, contestId } = req.body;
        const userId = req.result._id;

        console.log(problemId) ;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).json({ message: "Required fields are missing." });
        }

        // --- Contest Logic (remains the same) ---
        let contest = null;
        if (contestId) {
            contest = await Contest.findById(contestId).populate('participants.user');
            if (!contest) return res.status(404).json({ message: "Contest not found" });
            const now = new Date();
            const endTime = new Date(contest.startTime.getTime() + contest.duration * 60000);
            if (now < contest.startTime || now > endTime) {
                return res.status(400).json({ message: "Contest is not active" });
            }
        }

        // --- Fetch Problem Data & Create Initial Submission ---
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const submissionEntry = await Submission.create({
            userId,
            problemId,
            code, // Store the user's original code
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });

        // --- Harnessing and Judge0 Submission ---
        const languageId = getLanguageById(language);
        const fullSourceCode = buildHarness(language, code, problem.functionName, problem.tags);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: fullSourceCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submissionResponses = await submitBatch(submissions);
        console.log(submissionResponses) ;
        const tokens = submissionResponses?.map((s) => s.token);

        // --- Polling for Final Results ---
        let finalResults;
        let attempts = 0;
        while (attempts < 15) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const polledResults = await submitToken(tokens);
            const resultsArray = Array.isArray(polledResults) ? polledResults : (polledResults.submissions || []);
            const isProcessing = resultsArray.some(r => r && r.status && (r.status.id === 1 || r.status.id === 2));
            if (!isProcessing) {
                finalResults = resultsArray;
                break;
            }
            attempts++;
        }

        if (!finalResults || finalResults.length === 0) {
            submissionEntry.status = 'error';
            submissionEntry.errorMessage = 'Execution timed out or Judge0 is unavailable.';
            await submissionEntry.save();
            return res.status(500).json({ message: 'Grading timed out.' });
        }

        // --- Process Results and Update Database ---
        let passedCount = 0;
        let totalTime = 0;
        let maxMemory = 0;
        let firstError = null;

        for (const result of finalResults) {
            if (result.status.id === 3) { // Accepted
                passedCount++;
                totalTime += parseFloat(result.time || 0);
                maxMemory = Math.max(maxMemory, result.memory || 0);
            } else if (!firstError) {
                // Store the first error encountered
                const errorDetails = result.compile_output || result.stderr || "No details available.";
                firstError = {
                    status: result.status.description,
                    details: errorDetails,
                };
            }
        }
        
        const finalStatus = (passedCount === problem.hiddenTestCases.length) ? 'accepted' : 'rejected';

        submissionEntry.status = finalStatus;
        submissionEntry.testCasesPassed = passedCount;
        submissionEntry.errorMessage = firstError ? `${firstError.status}: ${firstError.details}` : null;
        submissionEntry.runtime = totalTime;
        submissionEntry.memory = maxMemory;
        await submissionEntry.save();

        // --- Update User/Contest Stats ---
        if (finalStatus === 'accepted' && !contestId && !req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }
        
        if (contest && finalStatus === 'accepted') {
            // Your existing contest update logic here...
        }

        // --- Send Clean Response to Frontend ---
        res.status(201).json({
            status: finalStatus,
            passedTestCases: passedCount,
            totalTestCases: submissionEntry.testCasesTotal,
            runtime: totalTime.toFixed(3),
            memory: maxMemory,
            error: firstError // Send the structured error object
        });

    } catch (err) {
        console.error("Error in submitCode:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const runCode = async (req, res) => {
    try {
        const { id: problemId } = req.params;
        const { code, language } = req.body;

        if (!code || !problemId || !language) {
            return res.status(400).json({ message: "Code, language, or problemId is missing." });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const languageId = getLanguageById(language);
        const fullSourceCode = buildHarness(language, code, problem.functionName, problem.tags);

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: fullSourceCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        
        const submissionResponses = await submitBatch(submissions);
        const tokens = submissionResponses.map((s) => s.token);

        let finalResults;
        let attempts = 0;
        while (attempts < 15) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const polledResults = await submitToken(tokens);
            // Defensive check for the response structure
            const resultsArray = Array.isArray(polledResults) ? polledResults : (polledResults.submissions || []);
            
            const isProcessing = resultsArray.some(r => r.status.id === 1 || r.status.id === 2);
            if (!isProcessing) {
                finalResults = resultsArray;
                break;
            }
            attempts++;
        }

        if (!finalResults || finalResults.length === 0) {
            return res.status(500).json({ message: "Execution timed out or Judge0 returned an empty response." });
        }

        // NO MORE DECODING. Judge0 is sending plain text.
        // We simply pass the results through.
        
        res.status(200).json({
            message: "Run successful",
            results: finalResults 
        });

    } catch (err) {
        console.error("FATAL ERROR in runCode controller:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


module.exports = {submitCode,runCode};