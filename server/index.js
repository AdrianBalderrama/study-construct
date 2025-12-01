const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Team } = require('./agent');
const { MultimodalProcessor } = require('./multimodal/MultimodalProcessor');
const path = require('path');

// Load environment variables from .env.local (or .env as fallback)
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config(); // Fallback to .env if .env.local doesn't exist

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' })); // Increased for multimodal content

// Serve static files from client
app.use(express.static(path.join(__dirname, '../client')));

// Step 1: Research Phase
app.post('/api/research', async (req, res) => {
    try {
        const { token, modelId, content, documentText, weaknesses } = req.body;

        if (!token) return res.status(401).json({ error: "Missing Access Token" });

        let extractedText = documentText;
        if (content && content.type === 'multimodal') {
            const project = process.env.GOOGLE_CLOUD_PROJECT;
            const location = process.env.GOOGLE_CLOUD_LOCATION;

            if (!project || !location) {
                throw new Error("Missing GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_LOCATION in environment variables");
            }
            const processor = new MultimodalProcessor(project, location, token);
            extractedText = await processor.extractContent(content.base64, content.mimeType, content.metadata.format);
        } else if (content && content.type === 'text') {
            extractedText = content.text;
        }

        const team = new Team(token, modelId, extractedText, weaknesses);

        // Run actual research using the agent
        const factsString = await team.runResearch((agent, type, msg) => {
            console.log(`[${agent}] ${type}: ${msg}`);
        });

        // Convert string output to array for UI
        const facts = factsString.split('\n').filter(line => line.trim().length > 0);

        res.json({ facts, extractedText });

    } catch (error) {
        console.error("Research Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Step 2: Generation Phase (Post-Review)
app.post('/api/generate', async (req, res) => {
    try {
        const { token, modelId, facts, weaknesses } = req.body;

        // Instantiate Team with empty doc text as we are passing facts directly
        const team = new Team(token, modelId, "", weaknesses);

        const quiz = await team.generateQuizFromFacts(facts.join('\n'), (agent, type, msg) => {
            console.log(`[${agent}] ${type}: ${msg}`);
        });

        res.json({ quiz });

    } catch (error) {
        console.error("Generation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// History Endpoints
app.get('/api/history', (req, res) => {
    const userId = 'user-1'; // Hardcoded for demo
    const memoryBank = require('./memory');
    const history = memoryBank.getUserMemory(userId).quizHistory || [];
    res.json(history);
});

app.post('/api/history', (req, res) => {
    const { score, total, topic } = req.body;
    const userId = 'user-1'; // Hardcoded for demo
    const memoryBank = require('./memory');

    const updatedHistory = memoryBank.recordQuizResult(userId, {
        score,
        total,
        topic: topic || 'General Study'
    });

    res.json(updatedHistory);
});

app.listen(PORT, () => {
    console.log(`Study Construct Server running on http://localhost:${PORT}`);
});
