/**
 * AudioParser - Parse audio files for multimodal processing
 * 
 * Responsibilities:
 * - Convert audio to base64
 * - Preserve MIME type
 * - Prepare for Gemini Audio API
 */

import { FormatParser } from '../FormatParser.js';
import { MimeTypeDetector } from '../MimeTypeDetector.js';

export class AudioParser extends FormatParser {
    supports(file) {
        const format = MimeTypeDetector.detect(file);
        return format === 'audio';
    }

    async parse(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                // Extract base64 data
                const dataUrl = e.target.result;
                const base64 = dataUrl.split(',')[1];

                resolve({
                    type: 'multimodal',
                    base64: base64,
                    mimeType: file.type || 'audio/mpeg', // Fallback MIME type
                    metadata: {
                        filename: file.name,
                        size: file.size,
                        format: 'audio',
                        lastModified: file.lastModified
                    }
                });
            };

            reader.onerror = () => {
                reject(new Error(`Failed to read audio file: ${file.name}`));
            };

            reader.readAsDataURL(file);
        });
    }
}
