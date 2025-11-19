const { LlmAgent, Gemini, FunctionTool, SequentialAgent, InMemoryRunner, stringifyContent } = require('@google/adk');
const { z } = require('zod');

class Team {
    constructor(token, modelId, documentText, weaknesses) {
        this.token = token;
        this.modelId = modelId;
        this.documentText = documentText;
        this.weaknesses = weaknesses || [];
    }

    async generateQuiz(onLog) {
        // 1. Initialize Model
        const model = new Gemini({
            vertexai: true,
            project: 'azst-genai-commercial-chatbot',
            location: 'us-central1',
            apiKey: this.token,
            model: this.modelId
        });

        // 2. Define Tools
        const searchTool = new FunctionTool({
            name: 'search_document',
            description: 'Search the document for keywords to find relevant facts.',
            parameters: z.object({ query: z.string().describe('The keyword to search for') }),
            execute: async ({ query }) => {
                onLog('Tool', 'EXECUTE', `Searching for: ${query}`);
                const lines = this.documentText.split('\n');
                const matches = lines.filter(l => l.toLowerCase().includes(query.toLowerCase()));
                const result = matches.slice(0, 5).join('\n') || "No matches found.";
                onLog('Tool', 'RESULT', `Found ${matches.length} matches.`);
                return result;
            }
        });

        // 3. Define Agents

        // Researcher: Finds facts
        let focus = "general concepts";
        if (this.weaknesses.length > 0) {
            focus = `concepts related to: ${this.weaknesses.join(', ')}`;
        }

        const researcher = new LlmAgent({
            name: 'Researcher',
            model: model,
            instruction: `
                You are a diligent Researcher.
                Your goal is to extract 5 key facts from the following document about: ${focus}.
                
                DOCUMENT:
                ${this.documentText}
                
                Output ONLY a numbered list of 5 facts, nothing else.
                Example:
                1. Fact one
                2. Fact two
                3. Fact three
                4. Fact four
                5. Fact five
            `
        });

        // Examiner: Creates quiz with diverse question types
        const examiner = new LlmAgent({
            name: 'Examiner',
            model: model,
            instruction: `
                You are an Examiner creating quiz questions.
                You will receive facts about a topic.
                Create exactly 5 questions with variety:
                - 3 multiple-choice questions
                - 1 true/false question  
                - 1 fill-in-the-blank question
                
                Output valid JSON array (no markdown):
                [
                    {
                        "type": "multiple-choice",
                        "question": "Question text?",
                        "options": ["A", "B", "C", "D"],
                        "correctIndex": 0
                    },
                    {
                        "type": "true-false",
                        "question": "Statement to verify.",
                        "correctAnswer": true
                    },
                    {
                        "type": "fill-blank",
                        "question": "Text with _____ blank.",
                        "correctAnswer": "answer",
                        "acceptableAnswers": ["answer", "Answer"],
                        "caseSensitive": false
                    }
                ]
            `
        });

        // 4. Orchestration (Sequential Team)
        const team = new SequentialAgent({
            name: 'QuizTeam',
            subAgents: [researcher, examiner]
        });

        // 5. Run
        const appName = 'study-construct';
        const runner = new InMemoryRunner({
            agent: team,
            appName: appName
        });

        onLog('Team', 'START', 'Starting ADK workflow...');

        let finalResponse = "";

        const sessionId = 'session-' + Date.now();
        const userId = 'user-1';

        // Explicitly create the session first
        await runner.sessionService.createSession({
            appName: appName,
            userId: userId,
            sessionId: sessionId
        });

        // Execute and stream events
        const eventStream = runner.runAsync({
            userId: userId,
            sessionId: sessionId,
            newMessage: { role: 'user', parts: [{ text: `Start the research and exam process.` }] }
        });

        for await (const event of eventStream) {
            // Check if this is an agent response (has content with model role)
            if (event.content && event.content.role === 'model' && event.author) {
                const content = stringifyContent(event);
                console.log(`[${event.author}] Response: "${content.substring(0, 100)}..."`);

                onLog(event.author, 'RESPONSE', `Completed`);

                // Capture response from Examiner (the final agent)
                if (event.author === 'Examiner' && content && content.trim().length > 0) {
                    finalResponse = content;
                    console.log(`Captured final response from Examiner`);
                }
            }

            // Check for errors
            if (event.errorCode) {
                console.log(`[${event.author}] ERROR ${event.errorCode}: ${event.errorMessage}`);
                onLog(event.author || 'System', 'ERROR', event.errorMessage || 'Unknown error');
            }
        }

        // Parse JSON from final response
        try {
            console.log("Final Raw Response:", finalResponse); // Log for debugging

            // Clean potential markdown and whitespace
            let cleanText = finalResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            // Find the array start and end
            const startIndex = cleanText.indexOf('[');
            const endIndex = cleanText.lastIndexOf(']');

            if (startIndex !== -1 && endIndex !== -1) {
                cleanText = cleanText.substring(startIndex, endIndex + 1);
            }

            const jsonMatch = cleanText.match(/\[\s*\{[\s\S]*\}\s*\]/);

            if (!jsonMatch) {
                throw new Error(`Failed to parse JSON. Raw output start: ${finalResponse.substring(0, 100)}...`);
            }

            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            onLog('Team', 'ERROR', `JSON parsing failed: ${e.message}`);
            throw e;
        }
    }
}

module.exports = { Team };
