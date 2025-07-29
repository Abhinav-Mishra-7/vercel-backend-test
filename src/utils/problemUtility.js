const axios = require("axios") ;
const { buildHarness } = require('./harness_builder'); 

// Getting Id for a particular language
const getLanguageById = (lang)=>{

    const language = {
        "cpp": 76 ,
        "java": 91 ,
        "javascript": 93
    }

    return language[lang.toLowerCase()] ;
}

// Checking that the given solution for the created problem is right or wrong using JUDGE0
const submitBatch = async (submissions)=>{
  // Here we are using "axios"

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false'
    },
    headers: {
      'x-rapidapi-key': "3e8cd3dfa8msh1b9c93e7d6f073cp1800fejsn056e89d221a0" ,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data ;
    } 
    catch (error) {
      console.error(error);
    }
  }

  return await fetchData();

}


const submitToken = async (resultToken)=>{

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken?.join(",") ,
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': "3e8cd3dfa8msh1b9c93e7d6f073cp1800fejsn056e89d221a0",
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data ;
    } catch (error) {
      console.error(error);
    }
  }

  while(true)
  {
    const result = await fetchData();

    const isResultObtained = result.submissions?.every((value) => value.status_id > 2) ;

    if(isResultObtained)
      return result.submissions ;

    setTimeout(()=> {
      return 1 ;
    } , 1000) ;

  }

}


// In utils/judge0_verifier.js

const LIST_NODE_DEFINITION = `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
`;

const TREE_NODE_DEFINITION = `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const verifyReferenceSolutions = async (referenceSolution, visibleTestCases, functionName, problemTag) => {
    // 1. Initial validation of inputs to this function.
    if (!visibleTestCases || visibleTestCases.length === 0) {
        return { isValid: false, message: "Cannot verify solution: No visible test cases provided." };
    }

    try {
        // 2. Loop through each language provided (C++, Java, JS).
        for (const solution of referenceSolution) {
            const languageId = getLanguageById(solution.language);
            
            // 3. Generate the full, runnable source code using the harness builder.
            // This combines boilerplate with the user's function-only code.
            const fullSourceCode = buildHarness(
                solution.language,
                solution.completeCode,
                functionName,
                problemTag
            );

            // 4. Create a submission for each visible test case.
            const submissions = visibleTestCases.map(testCase => ({
                language_id: languageId,
                source_code: fullSourceCode,
                stdin: testCase.input,
                expected_output: testCase.output,
            }));
            
            // 5. Submit the batch to Judge0 and get submission tokens.
            const submissionTokens = await submitBatch(submissions);
            const tokens = submissionTokens.map(s => s.token);

            let attempts = 0;
            const maxAttempts = 15; // Poll for a max of 15 seconds.

            // 6. Poll Judge0 until a result is ready.
            while (attempts < maxAttempts) {
                await sleep(1000);
                attempts++;

                const results = await submitToken(tokens);
                const isStillProcessing = results.some(r => r.status.id === 1 || r.status.id === 2);
                
                if (isStillProcessing) continue; // If not done, wait another second.

                // 7. Once all submissions are processed, check each result.
                for (const [index, result] of results.entries()) {
                    
                    // 8. If the result is not "Accepted" (status.id 3), we have an error.
                    if (result.status.id !== 3) {        
                        let decodedError = '';

                        // First, try to decode 'compile_output'. This is the ideal field.
                        if (result.compile_output) {
                            decodedError = Buffer.from(result.compile_output, 'base64').toString('utf-8');
                        }
                        
                        if (!decodedError && result.stderr) {
                            decodedError = Buffer.from(result.stderr, 'base64').toString('utf-8');
                        }

                        // Construct the final, human-readable error message.
                        const finalMessage = `Reference solution for ${solution.language} failed on test case #${index + 1}. Status: ${result.status.description}. Details: ${decodedError || 'No details available.'}`;
                        
                        // Stop and return the failure message.
                        return { isValid: false, message: finalMessage };
                    }
                }
                
                // If the loop finishes without returning, all tests for this language passed.
                break; 
            }

            if (attempts >= maxAttempts) {
                return { isValid: false, message: `Verification timed out for ${solution.language}. Judge0 may be slow or the solution has an infinite loop.` };
            }
        }

        // If the outer loop finishes, all languages were successfully verified.
        return { isValid: true, message: "All reference solutions passed verification." };

    } catch (error) {
        // This catches errors from our own code (e.g., harness builder error).
        console.error("Critical error during verification process:", error);
        return { isValid: false, message: `A critical error occurred: ${error.message}` };
    }
};

module.exports = {getLanguageById , submitBatch , submitToken , verifyReferenceSolutions} ;