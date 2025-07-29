// backend/controllers/solveDoubt.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ message: "Chat history is empty." });
        }

        // --- FIX #1: SEPARATE HISTORY FROM CURRENT MESSAGE ---
        // The `history` for the API should be all messages *except* the very last one.
        const allMessages = [...messages]; // Create a mutable copy
        const lastMessageObject = allMessages.pop(); // The last message is the current user prompt.

        // The remaining messages are the conversation history.
        let chatHistory = allMessages;

        // --- FIX #2: HANDLE THE "FIRST ROLE MUST BE USER" ERROR ---
        // The Google API requires the chat history to start with a 'user' role.
        // Our frontend's first message is a 'model' greeting. We must remove it from the history
        // before sending it to the API.
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            // If the first message is from the model, slice the array to start from the next element.
            // This ensures the history we pass to the API starts correctly.
            chatHistory = chatHistory.slice(1);
        }

        // Initialize the Gemini AI client
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        
        // Select the model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor. Your role is to help users solve the provided coding problem.
Your goal is to be a helpful and encouraging guide, not just an answer machine. 

## Current Problem Context
- **Title**: ${title}
- **Description**: ${description}
- **Examples**: ${JSON.stringify(testCases)}
- **Starter Code**: ${startCode}

## Your Core Task
Analyze the user's query and the chat history to provide the most relevant and helpful response. Your response MUST be a valid JSON object.

## Response JSON Schema
Your entire output must be a single JSON object with a key "response" which is an array of content blocks.
Each content block in the array is an object with two properties: "type" and "content".
- For explanatory text, use: { "type": "text", "content": "Your explanation here." }
- For code snippets, use: { "type": "code", "content": { "language": "javascript", "code": "console.log('hello');" } }

### Rules for the JSON response:
1.  **Always use the specified JSON structure.** Do not deviate.
2.  **Code Blocks:** When providing code, always identify the programming language (e.g., "javascript", "python", "java", "cpp"). If the user asks for a specific language, YOU MUST use that language. If they don't specify, use the language of the starter code or infer from the context.
3.  **Clarity and Conciseness:** Break down complex topics into multiple smaller text and code blocks.
4.  **Stay on Topic:** Only answer questions related to the provided DSA problem.

## Example JSON Output Format:
{
  "response": [
    { "type": "text", "content": "Of course! Let's start with a hint." },
    { "type": "code", "content": { "language": "javascript", "code": "const map = new Map();" } }
  ]
}
`,
        });

        const chat = model.startChat({
            // Pass the cleaned history to the model
            history: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
            },
        });
        
        const lastMessageText = lastMessageObject.parts[0]?.text;
        
        if (!lastMessageText) {
            return res.status(400).json({ message: "No message found to process." });
        }

        const result = await chat.sendMessage(lastMessageText); // Send ONLY the new message text
        const response = result.response;
        
        const responseJsonText = response.text();
        const parsedJson = JSON.parse(responseJsonText);

        res.status(200).json({
            message: parsedJson.response 
        });

    } catch (err) {
        console.error("AI CHAT ERROR:", err);
        // Provide a structured error message that the frontend can still render
        res.status(500).json({
            message: [{
                type: "text",
                content: "Sorry, I encountered an internal error. Please check the server logs and try again."
            }]
        });
    }
};

module.exports = solveDoubt; 





// const { GoogleGenAI } = require("@google/genai");


// const solveDoubt = async(req , res)=>{


//     try{

//         const {messages,title,description,testCases,startCode} = req.body;
//         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
       
//         async function main() {
//         const response = await ai.models.generateContent({
//         model: "gemini-1.5-flash-latest",
//         contents: messages,
//         config: {
//         systemInstruction: `
// You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

// ## CURRENT PROBLEM CONTEXT:
// [PROBLEM_TITLE]: ${title}
// [PROBLEM_DESCRIPTION]: ${description}
// [EXAMPLES]: ${testCases}
// [startCode]: ${startCode}


// ## YOUR CAPABILITIES:
// 1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
// 2. **Code Reviewer**: Debug and fix code submissions with explanations
// 3. **Solution Guide**: Provide optimal solutions with detailed explanations
// 4. **Complexity Analyzer**: Explain time and space complexity trade-offs
// 5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
// 6. **Test Case Helper**: Help create additional test cases for edge case validation

// ## INTERACTION GUIDELINES:

// ### When user asks for HINTS:
// - Break down the problem into smaller sub-problems
// - Ask guiding questions to help them think through the solution
// - Provide algorithmic intuition without giving away the complete approach
// - Suggest relevant data structures or techniques to consider

// ### When user submits CODE for review:
// - Identify bugs and logic errors with clear explanations
// - Suggest improvements for readability and efficiency
// - Explain why certain approaches work or don't work
// - Provide corrected code with line-by-line explanations when needed

// ### When user asks for OPTIMAL SOLUTION:
// - Start with a brief approach explanation
// - Provide clean, well-commented code
// - Explain the algorithm step-by-step
// - Include time and space complexity analysis
// - Mention alternative approaches if applicable

// ### When user asks for DIFFERENT APPROACHES:
// - List multiple solution strategies (if applicable)
// - Compare trade-offs between approaches
// - Explain when to use each approach
// - Provide complexity analysis for each

// ## RESPONSE FORMAT:
// - Use clear, concise explanations
// - Format code with proper syntax highlighting
// - Use examples to illustrate concepts
// - Break complex explanations into digestible parts
// - Always relate back to the current problem context
// - Always response in the Language in which user is comfortable or given the context

// ## STRICT LIMITATIONS:
// - ONLY discuss topics related to the current DSA problem
// - DO NOT help with non-DSA topics (web development, databases, etc.)
// - DO NOT provide solutions to different problems
// - If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

// ## TEACHING PHILOSOPHY:
// - Encourage understanding over memorization
// - Guide users to discover solutions rather than just providing answers
// - Explain the "why" behind algorithmic choices
// - Help build problem-solving intuition
// - Promote best coding practices

// Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.

// Give answers in json formate.
// example:

// text: Some text
// code: some code
// text: some text
// code: some code
// conclusion: final conclusion of the whole answer
// `},
//     });
     
//     res.status(201).json({
//         message:response.text
//     });
//     // console.log(response.text);
//     }

//     main();
      
//     }
//     catch(err){
//         res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// }

// module.exports = solveDoubt;
