const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Team } = require('./agent');

const app = express();
const PORT = 3001;

const path = require('path');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve static files from client
app.use(express.static(path.join(__dirname, '../client')));

app.post('/api/quiz', async (req, res) => {
    try {
        const { token, modelId, documentText, weaknesses } = req.body;

        if (!token) {
            return res.status(401).json({ error: "Missing Google Cloud Access Token" });
        }

        console.log("Received quiz request. Document length:", documentText.length);

        // Initialize the ADK Team
        const team = new Team(token, modelId, documentText, weaknesses);

        // Generate Quiz
        const quiz = await team.generateQuiz((agent, type, msg) => {
            // In a real app, we'd use WebSockets to stream logs.
            // For this prototype, we'll just log to server console.
            console.log(`[${agent}] ${type}: ${msg}`);
        });

        res.json({ quiz });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Study Construct Server running on http://localhost:${PORT}`);
});
