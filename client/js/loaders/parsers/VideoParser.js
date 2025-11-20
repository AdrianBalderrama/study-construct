/**
 * VideoParser - Parse video files for multimodal processing
 * 
 * Responsibilities:
 * - Convert video to base64
 * - Preserve MIME type
 * - Prepare for Gemini Video API
 */

import { FormatParser } from '../FormatParser.js';
import { MimeTypeDetector } from '../MimeTypeDetector.js';

export class VideoParser extends FormatParser {
    supports(file) {
        const format = MimeTypeDetector.detect(file);
        return format === 'video';
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
                    mimeType: file.type || 'video/mp4', // Fallback MIME type
                    metadata: {
                        filename: file.name,
                        size: file.size,
                        format: 'video',
                        lastModified: file.lastModified
                    }
                });
            };

            reader.onerror = () => {
                reject(new Error(`Failed to read video file: ${file.name}`));
            };

            reader.readAsDataURL(file);
        });
    }
}
