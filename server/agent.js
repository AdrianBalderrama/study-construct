const { LlmAgent, Gemini, FunctionTool, SequentialAgent, ParallelAgent, InMemoryRunner } = require('@google/adk');
const { VertexAI } = require('@google-cloud/vertexai');
const { z } = require('zod');
const memoryBank = require('./memory');

class Team {
    constructor(token, modelId, documentText, weaknesses) {
        this.token = token;
        this.modelId = modelId;
        this.documentText = documentText;
        this.weaknesses = weaknesses || [];
        this.userId = 'user-1'; // Hardcoded for demo
    }

    async runResearch(onLog) {
        // 0. Load Memory
        const userMem = memoryBank.getUserMemory(this.userId);
        const historicalWeaknesses = userMem.weaknesses;
        const allWeaknesses = [...new Set([...this.weaknesses, ...historicalWeaknesses])];

        onLog('System', 'MEMORY', `Loaded user history. Focusing on: ${allWeaknesses.join(', ')}`);

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
            name: 'google_search',
            description: 'Search Google for external facts and definitions when the document is insufficient.',
            parameters: z.object({ query: z.string().describe('The search query') }),
            execute: async ({ query }) => {
                onLog('Tool', 'SEARCH', `Searching Google for: ${query}`);
                return `[Search Result for ${query}]: Key concept definition and related facts found on the web.`;
            }
        });

        // 3. Phase 1: Research
        let focus = "general concepts";
        if (allWeaknesses.length > 0) {
            focus = `concepts related to: ${allWeaknesses.join(', ')}`;
        }

        const researcher = new LlmAgent({
            name: 'Researcher',
            model: model,
            tools: [searchTool],
            instruction: `
                You are a diligent Researcher.
                Your goal is to extract 5 key facts from the provided document about: ${focus}.
                If the document is missing key details about these topics, use the google_search tool to find them.
                
                Output ONLY a numbered list of 5 facts, nothing else.
            `
        });

        const sessionId = `session-${Date.now()}`;
        const runner = new InMemoryRunner({
            agent: researcher,
            appName: 'study-construct'
        });

        await runner.sessionService.createSession({
            appName: 'study-construct',
            userId: this.userId,
            sessionId: sessionId
        });

        let facts = '';
        const initialMessage = {
            role: 'user',
            parts: [{ text: `Here is the document:\n${this.documentText}\n\nStart the research process.` }]
        };

        const eventStream = runner.runAsync({
            userId: this.userId,
            sessionId: sessionId,
            newMessage: initialMessage
        });

        for await (const event of eventStream) {
            onLog(event.author || 'System', 'INFO', JSON.stringify(event));
            if (event.content?.role === 'model' && event.author === 'Researcher') {
                const text = event.content.parts.map(p => p.text).join('');
                if (text) facts += text;
            }
        }

        if (!facts) {
            throw new Error("Researcher failed to produce facts.");
        }

        // Save topic to memory
        memoryBank.recordTopicStudied(this.userId, focus);

        return facts;
    }

    async generateQuizFromFacts(facts, onLog) {
        onLog('System', 'INFO', 'Starting Parallel Examiners...');

        // Initialize raw Vertex AI client for parallel requests
        const vertexAI = new VertexAI({
            project: 'azst-genai-commercial-chatbot',
            location: 'us-central1'
        });
        const generativeModel = vertexAI.getGenerativeModel({
            model: this.modelId
        });

        const prompts = [
            `Based on these facts:\n${facts}\n\nCreate 3 multiple-choice questions. Output valid JSON array of objects matching this schema:\n{ "type": "multiple-choice", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }`,

            `Based on these facts:\n${facts}\n\nCreate 1 true/false question. Output valid JSON array of objects matching this schema:\n{ "type": "true-false", "question": "...", "correctAnswer": true }`,

            `Based on these facts:\n${facts}\n\nCreate 1 fill-in-the-blank question. Output valid JSON array of objects matching this schema:\n{ "type": "fill-blank", "question": "Text with _____ blank", "correctAnswer": "word", "acceptableAnswers": ["word", "Word"] }`
        ];

        // Helper to run a prompt and return text
        const runPrompt = async (prompt, type) => {
            try {
                onLog(type, 'START', 'Generating questions...');
                const result = await generativeModel.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                const text = result.response.candidates[0].content.parts[0].text;
                onLog(type, 'DONE', 'Generated questions.');
                return text;
            } catch (e) {
                console.error(`Error in ${type}:`, e);
                return "[]";
            }
        };

        const results = await Promise.all([
            runPrompt(prompts[0], 'MCQ_Examiner'),
            runPrompt(prompts[1], 'TF_Examiner'),
            runPrompt(prompts[2], 'Blank_Examiner')
        ]);

        // Parse and merge results
        let allQuestions = [];
        for (const res of results) {
            let cleanPart = res.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            try {
                const parsed = JSON.parse(cleanPart);
                if (Array.isArray(parsed)) {
                    allQuestions = allQuestions.concat(parsed);
                } else if (typeof parsed === 'object') {
                    allQuestions.push(parsed);
                }
            } catch (e) {
                console.warn("Failed to parse partial output:", cleanPart);
            }
        }

        if (allQuestions.length === 0) {
            // Fallback if parsing fails completely
            return [
                { type: "multiple-choice", question: "Error generating questions. Please try again.", options: ["Retry"], correctIndex: 0 }
            ];
        }

        return allQuestions;
    }

    async generateQuiz(onLog) {
        const facts = await this.runResearch(onLog);
        return await this.generateQuizFromFacts(facts, onLog);
    }
}


module.exports = { Team };

