import { Agent } from './Agent.js';
import { DocumentSearchTool, QuizFormatterTool } from './Tool.js';
import { Memory } from './Memory.js';

export class Team {
    constructor(llmService, documentText, onLog) {
        this.llm = llmService;
        this.documentText = documentText;
        this.onLog = onLog; // Callback for UI logging
        this.memory = new Memory();

        // Initialize Tools
        const searchTool = new DocumentSearchTool(documentText);
        const formatTool = new QuizFormatterTool();

        // Initialize Agents (Day 5: Multi-Agent)
        this.researcher = new Agent(
            "Researcher",
            "diligent analyst who finds key facts in text.",
            llmService,
            [searchTool]
        );

        this.examiner = new Agent(
            "Examiner",
            "strict professor who creates difficult questions.",
            llmService,
            [formatTool]
        );
    }

    async generateQuiz() {
        // 1. Research Phase
        const weaknesses = this.memory.getWeaknesses();
        let focus = "general key concepts";
        if (weaknesses.length > 0) {
            focus = `concepts related to: ${weaknesses.join(', ')}`;
            this.onLog("Team", "STRATEGY", `Focusing on user weaknesses: ${weaknesses.join(', ')}`);
        }

        this.onLog("Team", "START", "Starting quiz generation workflow...");

        const researchTask = `Read the document and extract 5 key facts about ${focus}. Use the search_document tool if needed.`;
        const facts = await this.researcher.run(researchTask, this.onLog);

        // 2. Examination Phase
        const examTask = `Create a quiz with 5 multiple-choice questions based on these facts:\n${facts}\nOutput MUST be valid JSON array.`;
        const quizRaw = await this.examiner.run(examTask, this.onLog);

        // Clean up JSON
        try {
            const jsonMatch = quizRaw.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (!jsonMatch) throw new Error("Failed to parse JSON");
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            this.onLog("Team", "ERROR", "JSON parsing failed, retrying...");
            return []; // In a real app, we'd have a "Fixer" agent here.
        }
    }
}
