export class Agent {
    constructor(name, role, llmService, tools = []) {
        this.name = name;
        this.role = role;
        this.llm = llmService;
        this.tools = tools;
        this.memory = []; // Conversation history
    }

    async run(task, onThought) {
        this.memory.push({ role: 'user', parts: [{ text: `TASK: ${task}` }] });

        // 1. Thought (Planning)
        const thought = `I need to ${task}. I have tools: ${this.tools.map(t => t.name).join(', ')}.`;
        if (onThought) onThought(this.name, "THOUGHT", thought);

        // 2. Action (Tool Selection - Simplified for this prototype)
        // Real ADK would use function calling API. Here we simulate the loop.

        let context = "";
        if (this.tools.length > 0) {
            // Simulate "Reasoning" to use a tool
            if (task.includes("read") || task.includes("search")) {
                const searchTool = this.tools.find(t => t.name === 'search_document');
                if (searchTool) {
                    if (onThought) onThought(this.name, "ACTION", `Calling ${searchTool.name}...`);
                    const result = await searchTool.execute("Bauhaus"); // Hardcoded query for demo flow
                    context = `\nSEARCH RESULTS:\n${result}\n`;
                    if (onThought) onThought(this.name, "OBSERVATION", "Found relevant sections.");
                }
            }
        }

        // 3. Final Response (Generation)
        const systemPrompt = `You are ${this.name}, a ${this.role}. 
        Use the following context to answer the user's task.
        ${context}
        Output MUST be valid JSON if requested.`;

        // We construct a one-shot prompt for the LLM
        const response = await this.llm.generateRaw(systemPrompt + "\n\n" + task);

        if (onThought) onThought(this.name, "RESPONSE", "Generated output.");
        return response;
    }
}
