const { LlmAgent, Gemini, FunctionTool, SequentialAgent, InMemoryRunner } = require('@google/adk');
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
                onLog('Tool', 'EXECUTE', `Searching for: ${query} `);
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
            focus = `concepts related to: ${this.weaknesses.join(', ')} `;
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
- 3 multiple - choice questions
    - 1 true / false question
        - 1 fill -in -the - blank question
                
                Output valid JSON array(no markdown):
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

        // 5. Create runner and run the team
        const sessionId = `session - ${Date.now()} `;
        const runner = new InMemoryRunner({
            agent: team,
            appName: 'study-construct'
        });

        // Create the session first
        await runner.sessionService.createSession({
            appName: 'study-construct',
            userId: 'user-1',
            sessionId: sessionId
        });

        let finalResponse = '';

        // Create Content object for the initial message
        const initialMessage = {
            role: 'user',
            parts: [{ text: 'Start the research and exam process.' }]
        };

        const eventStream = runner.runAsync({
            userId: 'user-1',
            sessionId: sessionId,
            newMessage: initialMessage
        });

        for await (const event of eventStream) {
            onLog(event.author || 'System', 'INFO', JSON.stringify(event));

            // Capture Examiner's final response
            if (event.content?.role === 'model' && event.author === 'Examiner') {
                const text = event.content.parts
                    .filter(p => p.text)
                    .map(p => p.text)
                    .join('');

                if (text) {
                    finalResponse += text;
                }
            }
        }

        // 6. Parse JSON
        let cleanedResponse = finalResponse.trim();

        // Remove markdown code fences if present
        cleanedResponse = cleanedResponse.replace(/```json\s */g, '');
        cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
        cleanedResponse = cleanedResponse.trim();

        // Try to find JSON array
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
        }

        console.log('Final Raw Response:', finalResponse.substring(0, 200));

        try {
            const quiz = JSON.parse(cleanedResponse);
            return quiz;
        } catch (error) {
            console.error('[Team] JSON parsing failed:', error);
            console.error('Raw output start:', finalResponse.substring(0, 200));
            throw new Error('Failed to parse JSON. Raw output start: ...');
        }
    }
}


module.exports = { Team };
