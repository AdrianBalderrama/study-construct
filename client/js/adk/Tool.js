export class Tool {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    async execute(input) {
        throw new Error("Method 'execute' must be implemented.");
    }
}

export class DocumentSearchTool extends Tool {
    constructor(documentText) {
        super(
            "search_document",
            "Search the uploaded document for specific keywords or sections. Input: 'query string'."
        );
        this.documentText = documentText;
    }

    async execute(query) {
        // Simple keyword search for prototype (simulating vector search)
        // In a real app, this would use embeddings.
        const lines = this.documentText.split('\n');
        const matches = lines.filter(line => line.toLowerCase().includes(query.toLowerCase()));

        if (matches.length === 0) return "No exact matches found. Try a broader term.";
        return matches.slice(0, 5).join('\n'); // Return top 5 matching lines
    }
}

export class QuizFormatterTool extends Tool {
    constructor() {
        super(
            "format_quiz",
            "Format the final quiz questions into valid JSON. Input: The raw text of the questions."
        );
    }

    async execute(rawText) {
        // This tool is a "shim" to ensure the agent's output is strictly formatted.
        // In a real ADK, this might use a specific 'response_schema'.
        return rawText; // The Agent's system prompt handles most of this, but this tool represents the "Action" of finalizing.
    }
}
