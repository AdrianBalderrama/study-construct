/**
 * ImageParser - Parse image files for multimodal processing
 * 
 * Responsibilities:
 * - Convert images to base64
 * - Preserve MIME type
 * - Prepare for Gemini Vision API
 */

import { FormatParser } from '../FormatParser.js';
import { MimeTypeDetector } from '../MimeTypeDetector.js';

export class ImageParser extends FormatParser {
    supports(file) {
        const format = MimeTypeDetector.detect(file);
        return format === 'image';
    }

    async parse(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                // Extract base64 data (remove data:image/...;base64, prefix)
                const dataUrl = e.target.result;
                const base64 = dataUrl.split(',')[1];

                resolve({
                    type: 'multimodal',
                    base64: base64,
                    mimeType: file.type || 'image/jpeg', // Fallback MIME type
                    metadata: {
                        filename: file.name,
                        size: file.size,
                        format: 'image',
                        lastModified: file.lastModified
                    }
                });
            };

            reader.onerror = () => {
                reject(new Error(`Failed to read image file: ${file.name}`));
            };

            reader.readAsDataURL(file);
        });
    }
}
