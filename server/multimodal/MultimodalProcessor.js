/**
 * MultimodalProcessor - Process multimodal content with Gemini API
 * 
 * Responsibilities:
 * - Extract content from images using Gemini Vision
 * - Transcribe audio using Gemini Audio
 * - Extract content from video using Gemini Video
 * - Provide format-specific prompts
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class MultimodalProcessor {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash'
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
        const prompt = this.getPromptForFormat(format);

        try {
            const result = await this.model.generateContent([
                {
                    inlineData: {
                        data: base64,
                        mimeType: mimeType
                    }
                },
                prompt
            ]);

            const response = await result.response;
            const text = response.text();

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

    /**
     * Check if API key is valid
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.genAI;
    }
}

module.exports = { MultimodalProcessor };
