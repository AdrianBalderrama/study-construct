/**
 * MultimodalProcessor - Process multimodal content with Vertex AI
 * 
 * Responsibilities:
 * - Extract content from images using Gemini Vision (Vertex AI)
 * - Transcribe audio using Gemini Audio (Vertex AI)
 * - Extract content from video using Gemini Video (Vertex AI)
 * - Provide format-specific prompts
 */

const { VertexAI } = require('@google-cloud/vertexai');

class MultimodalProcessor {
    constructor(project, location, token) {
        // Initialize Vertex AI with project and location
        // Note: token is handled automatically by the SDK if using ADC, 
        // or can be passed if needed (though VertexAI SDK usually uses GoogleAuth)
        // If running locally with gcloud auth, we don't strictly need to pass the token 
        // if the environment is set up correctly, but we'll initialize with project/location.

        this.vertexAI = new VertexAI({
            project: project,
            location: location
        });

        this.model = this.vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash'
        });
    }

    /**
     * Extract content from multimodal file
     * @param {string} base64 - Base64 encoded file
     * @param {string} mimeType - MIME type
     * @param {string} format - Format type (image|audio|video)
     * @returns {Promise<string>} Extracted text content
     */
    async extractContent(base64, mimeType, format) {
        const promptText = this.getPromptForFormat(format);

        try {
            const request = {
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                data: base64,
                                mimeType: mimeType
                            }
                        },
                        { text: promptText }
                    ]
                }]
            };

            const result = await this.model.generateContent(request);
            const response = await result.response;

            // Vertex AI response structure might differ slightly
            const text = response.candidates[0].content.parts[0].text;

            console.log(`[MultimodalProcessor] Extracted ${text.length} characters from ${format}`);
            return text;
        } catch (error) {
            console.error(`[MultimodalProcessor] Error processing ${format}:`, error);
            throw new Error(`Failed to process ${format}: ${error.message}`);
        }
    }

    /**
     * Get format-specific prompt for content extraction
     * @param {string} format - Format type
     * @returns {string} Prompt text
     * @private
     */
    getPromptForFormat(format) {
        const prompts = {
            image: `Analyze this image thoroughly and extract all information:
                    - Any text visible in the image (OCR)
                    - Diagrams, charts, and visual data
                    - Key concepts and relationships shown
                    - Important details and context
                    
                    Format the output as clear, structured text that can be used to create educational quiz questions.
                    Be comprehensive and detailed.`,

            audio: `Transcribe this audio file completely and accurately:
                    - All spoken words and dialogue
                    - Key topics and concepts discussed
                    - Important points and takeaways
                    - Context and background information
                    
                    Format the output as clear, structured text suitable for creating quiz questions.`,

            video: `Analyze this video comprehensively:
                    - Transcribe all spoken words and dialogue
                    - Describe visual elements, scenes, and demonstrations
                    - Extract any text visible in the video
                    - Identify key concepts and topics covered
                    - Note important details and context
                    
                    Format the output as clear, structured text that can be used to create educational quiz questions.
                    Be thorough and detailed.`
        };

        return prompts[format] || 'Extract and describe all content from this file in detail.';
    }
}

module.exports = { MultimodalProcessor };
