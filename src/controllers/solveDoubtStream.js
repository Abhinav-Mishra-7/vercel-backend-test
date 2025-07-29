const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubtStream = async (req, res) => {
    // This top-level try/catch handles initial errors before the stream starts.
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        // Your validation is excellent. No changes needed here.
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Chat history cannot be empty." });
        }

        const cleanedMessages = messages.filter(
            (msg) => msg.role && msg.parts && msg.parts[0] && typeof msg.parts[0].text === 'string'
        );
        
        if (cleanedMessages.length === 0) {
            return res.status(400).json({ error: "No valid message content to process." });
        }

        // Set Headers for SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); 
        res.flushHeaders();

        // Start heartbeat to keep the connection alive
        const heartbeatInterval = setInterval(() => {
            res.write(':ping\n\n'); 
        }, 15000);
        
        // Ensure cleanup happens if the client disconnects
        req.on('close', () => {
            clearInterval(heartbeatInterval);
        });

        // --- START OF CRITICAL CHANGES ---

        // This inner try/finally ensures the stream resources are always cleaned up
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

            // Choose your model. Pro for quality, Flash for speed.
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            // 1. DYNAMICALLY CREATE THE SYSTEM PROMPT
            // It's better to define it here so it has access to the request body variables.
            const systemInstruction = `
You are an elite Data Structures and Algorithms (DSA) tutor. Your primary goal is to provide comprehensive, structured, and highly educational explanations to help users master the provided coding problem. You must be an expert guide, not just an answer key.

## Current Problem Context
- **Title**: ${title}
- **Description**: ${description}
- **Examples**: ${JSON.stringify(testCases)}
- **Starter Code**: ${startCode}

---

After and before every heading (like ## Heading, ### Sub-heading) and after every Markdown code block, you MUST include a single empty line to ensure proper spacing and readability on the frontend.

## ⭐️ MANDATORY RESPONSE STRUCTURE ⭐️
When a user asks for a solution, a hint, or an explanation, you MUST structure your response using the following Markdown format with these exact headings.

There must be an empty line here.

### 🧠 Conceptual Approach
Start here. First, explain the high-level strategy for solving the problem. Name the approach (e.g., "Two Pointers," "Hash Map / Dictionary," "Sliding Window," "Breadth-First Search"). Explain *why* this approach is suitable for this problem in 1-2 clear paragraphs.

There must be an empty line here.

### 📝 Step-by-Step Logic
Provide a clear, numbered list of the steps required to implement the logic. This should be like pseudocode written in plain English.
1.  Initialize a variable...
2.  Iterate through the array...
3.  Inside the loop, check for the condition...
4.  Return the final result.

There must be an empty line here.

### 💻 Code Implementation
This is the most critical section.
- If the user asks for a generic "solution" or "code," you MUST provide the implementation in **C++, Java, Python, and JavaScript**.
- You MAY also include C#, PHP, and Rust if they are particularly well-suited to the problem.
- **EXCEPTION:** If the user asks for a solution in **ONE specific language** (e.g., "give me the C++ solution"), then you MUST ONLY provide the code for that single language.
- Every single code block must be a correctly formatted, fenced Markdown block with the language identifier.

There must be an empty line here.

### 📈 Complexity Analysis
After the code, provide a brief analysis of the solution's performance.
- **Time Complexity:** State the Big O notation (e.g., O(n), O(log n), O(n^2)) and briefly explain why.
- **Space Complexity:** State the Big O notation (e.g., O(1), O(n)) and briefly explain what data structures are contributing to the memory usage.

There must be an empty line here.

---

## INTERACTION GUIDELINES
- **Be Encouraging:** Use a positive and helpful tone.
- **Clarity is Key:** Explain complex concepts in simple terms.
- **Review User Code:** If a user provides their code, analyze it, identify bugs or areas for improvement, and explain your reasoning clearly, referencing the structure above.

## STRICT LIMITATIONS
- **Stay on Topic:** ONLY discuss the provided DSA problem. If asked about anything else, politely decline and steer the conversation back to the problem.
- **Adhere to the Format:** The response structure and spacing rules defined above are not optional. It is your primary directive. Do not deviate from it.
`;

            // 2. PREPARE CHAT HISTORY WITH THE SYSTEM PROMPT
            // The system instruction must be the first "user" message in the history.
            const chatHistoryForApi = [ 
                {
                    role: "user",
                    parts: [{ text: systemInstruction }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will act as an elite DSA tutor and follow all formatting rules." }],
                },
                // Now, add the actual user chat history
                ...cleanedMessages
            ];

            // The last message is the actual prompt
            const lastMessage = chatHistoryForApi.pop();

            const chat = model.startChat({ history: chatHistoryForApi });
            const result = await chat.sendMessageStream(lastMessage.parts);

            // Stream the response
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
            }
            
            // Signal to the client that the stream is complete
            res.write(`data: ${JSON.stringify({ text: '[DONE]' })}\n\n`);

        } finally {
            // 3. GUARANTEED CLEANUP
            // This block will run whether the stream succeeds or fails.
            clearInterval(heartbeatInterval);
            res.end(); // This closes the connection properly.
        }

    } catch (err) {
        console.error("FATAL STREAM SETUP ERROR:", err);
        // If we get here, headers were likely not sent, so we can send a normal error.
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to initialize AI stream." });
        } else {
            // If headers were sent, we can only end the connection.
            res.end();
        }
    }
};

module.exports = { solveDoubtStream };



// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const solveDoubtStream = async (req, res) => {
//     try {
//         const { messages, title, description, testCases, startCode } = req.body;

//         // --- START OF FIX: ROBUST VALIDATION ---

//         // 1. Check if messages array exists and is not empty
//         if (!messages || messages.length === 0) {
//             console.error("Validation Error: 'messages' array is empty or missing.");
//             // Don't stream an error, just send a normal HTTP error response.
//             return res.status(400).json({ error: "Chat history cannot be empty." });
//         }

//         // 2. Filter out any malformed or empty messages from the history
//         // This prevents sending parts with no data.
//         const cleanedMessages = messages.filter(
//             (msg) => msg.parts && msg.parts[0] && typeof msg.parts[0].text === 'string' && msg.parts[0].text.trim() !== ''
//         );
        
//         if (cleanedMessages.length === 0) {
//             console.error("Validation Error: No valid messages with text content found.");
//             return res.status(400).json({ error: "No valid message content to process." });
//         }

//         const allMessages = [...cleanedMessages]; // Use the cleaned array

//         // --- END OF FIX ---


//         // Set Headers for SSE
//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');
//          res.setHeader('X-Accel-Buffering', 'no'); 
//         res.flushHeaders();

//         const heartbeatInterval = setInterval(() => {
//             // The colon ":" marks this as a comment, which is ignored by frontend's onmessage
//             res.write(':ping\n\n'); 
//         }, 15000);

//         // The rest of your logic remains the same but is now safer
//         const lastMessageObject = allMessages.pop(); 
//         let chatHistory = allMessages;
//         if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
//             chatHistory = chatHistory.slice(1);
//         }
        
//         const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
//         const model = genAI.getGenerativeModel({
//             model: "gemini-1.5-flash-latest",
//             systemInstruction: `
// You are an elite Data Structures and Algorithms (DSA) tutor. Your primary goal is to provide comprehensive, structured, and highly educational explanations to help users master the provided coding problem. You must be an expert guide, not just an answer key.

// ## Current Problem Context
// - **Title**: ${title}
// - **Description**: ${description}
// - **Examples**: ${JSON.stringify(testCases)}
// - **Starter Code**: ${startCode}

// ---

// ## ⭐️ MANDATORY RESPONSE STRUCTURE ⭐️
// When a user asks for a solution, a hint, or an explanation, you MUST structure your response using the following Markdown format with these exact headings.

// ### 🧠 Conceptual Approach
// Start here. First, explain the high-level strategy for solving the problem. Name the approach (e.g., "Two Pointers," "Hash Map / Dictionary," "Sliding Window," "Breadth-First Search"). Explain *why* this approach is suitable for this problem in 1-2 clear paragraphs.

// ### 📝 Step-by-Step Logic
// Provide a clear, numbered list of the steps required to implement the logic. This should be like pseudocode written in plain English.
// 1.  Initialize a variable...
// 2.  Iterate through the array...
// 3.  Inside the loop, check for the condition...
// 4.  Return the final result.

// ### 💻 Code Implementation
// This is the most critical section.
// - If the user asks for a generic "solution" or "code," you MUST provide the implementation in **C++, Java, Python, and JavaScript**.
// - You MAY also include C#, PHP, and Rust if they are particularly well-suited to the problem.
// - **EXCEPTION:** If the user asks for a solution in **ONE specific language** (e.g., "give me the C++ solution"), then you MUST ONLY provide the code for that single language.
// - Every single code block must be a correctly formatted, fenced Markdown block with the language identifier.

// ### 📈 Complexity Analysis
// After the code, provide a brief analysis of the solution's performance.
// - **Time Complexity:** State the Big O notation (e.g., O(n), O(log n), O(n^2)) and briefly explain why.
// - **Space Complexity:** State the Big O notation (e.g., O(1), O(n)) and briefly explain what data structures are contributing to the memory usage.

// ---

// ## INTERACTION GUIDELINES
// - **Be Encouraging:** Use a positive and helpful tone.
// - **Clarity is Key:** Explain complex concepts in simple terms.
// - **Review User Code:** If a user provides their code, analyze it, identify bugs or areas for improvement, and explain your reasoning clearly, referencing the structure above.

// ## STRICT LIMITATIONS
// - **Stay on Topic:** ONLY discuss the provided DSA problem. If asked about anything else, politely decline and steer the conversation back to the problem.
// - **Adhere to the Format:** The response structure defined above is not optional. It is your primary directive. Do not deviate from it.
//             `});

//         const chat = model.startChat({ history: chatHistory });
//         const lastMessageText = lastMessageObject.parts[0].text; // We know this exists now

//         const result = await chat.sendMessageStream(lastMessageText);

//         for await (const chunk of result.stream) {
//             const chunkText = chunk.text();
//             res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
//         }
        
//         res.end();

//     } catch (err) {
//         // This is a catch-all for unexpected errors. The validation above should prevent the 400 Bad Request.
//         console.error("AI STREAM ERROR:", err);
//         // We can't send a JSON error if headers are already flushed, just end the connection.
//         res.end();
//     }
// };

// module.exports = { solveDoubtStream };