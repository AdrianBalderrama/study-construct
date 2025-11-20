/**
 * TextParser - Parse plain text files
 * 
 * Responsibilities:
 * - Read text files (.txt, .md, .csv, .json)
 * - Extract text content
 * - Preserve metadata
 */

import { FormatParser } from '../FormatParser.js';
import { MimeTypeDetector } from '../MimeTypeDetector.js';

export class TextParser extends FormatParser {
    supports(file) {
        const format = MimeTypeDetector.detect(file);
        return format === 'text';
    }

    async parse(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve({
                    type: 'text',
                    text: e.target.result,
                    metadata: {
                        filename: file.name,
                        size: file.size,
                        format: 'text',
                        lastModified: file.lastModified
                    }
                });
            };

            reader.onerror = () => {
                reject(new Error(`Failed to read text file: ${file.name}`));
            };

            reader.readAsText(file);
        });
    }
}
