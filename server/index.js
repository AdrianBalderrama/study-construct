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

app.post('/api/quiz', async (req, res) => {
    try {
        const { token, modelId, content, documentText, weaknesses } = req.body;

        if (!token) {
            return res.status(401).json({ error: "Missing Google Cloud Access Token" });
        }

        let extractedText;

        // Backward compatibility: support old documentText parameter
        if (documentText) {
            extractedText = documentText;
            console.log("Received text content (legacy). Length:", extractedText.length);
        }
        // New multimodal content parameter
        else if (content) {
            // Handle different content types
            if (content.type === 'text') {
                // Direct text content
                extractedText = content.text;
                console.log("Received text content. Length:", extractedText.length);
            } else if (content.type === 'multimodal') {
                // Process multimodal content with Gemini (Vertex AI)
                console.log(`Processing ${content.metadata.format} file:`, content.metadata.filename);

                // Use Vertex AI with Project ID and Location
                // Project ID retrieved from gcloud config: azsb-it-genai
                const project = process.env.GOOGLE_CLOUD_PROJECT || 'azsb-it-genai';
                const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

                const processor = new MultimodalProcessor(project, location, token);

                extractedText = await processor.extractContent(
                    content.base64,
                    content.mimeType,
                    content.metadata.format
                );

                console.log(`Extracted ${extractedText.length} characters from ${content.metadata.format}`);
            } else {
                return res.status(400).json({ error: "Invalid content type" });
            }
        } else {
            return res.status(400).json({ error: "Missing content or documentText parameter" });
        }

        // Generate Quiz with extracted text
        const team = new Team(token, modelId, extractedText, weaknesses);
        const quiz = await team.generateQuiz((agent, type, msg) => {
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
