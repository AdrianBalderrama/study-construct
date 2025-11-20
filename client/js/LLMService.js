export class LLMService {
    constructor() {
        this.projectId = 'azst-genai-commercial-chatbot';
        this.region = 'us-central1';
        this.token = localStorage.getItem('sc_token') || '';
        this.modelId = localStorage.getItem('sc_model') || 'gemini-2.5-flash';
    }

    setCredentials(token, modelId) {
        this.token = token;
        this.modelId = modelId;
        localStorage.setItem('sc_token', token);
        localStorage.setItem('sc_model', modelId);
    }

    async generateRaw(promptText) {
        if (!this.token) throw new Error("Missing Access Token");

        const url = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/publishers/google/models/${this.modelId}:generateContent`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: promptText }] }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Vertex AI Error: ${err}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async generateQuiz(parsedContent, weaknesses = []) {
        if (!this.token) throw new Error("Missing Access Token");

        const response = await fetch('http://localhost:3001/api/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: this.token,
                modelId: this.modelId,
                content: parsedContent,  // Send full parsed content object
                weaknesses: weaknesses
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Server Error: ${err}`);
        }

        const data = await response.json();
        return data.quiz;
    }
}
