/**
 * FormatParser - Base class for all format parsers
 * 
 * Responsibilities:
 * - Define common interface for parsers
 * - Provide type definitions for parsed content
 */

export class FormatParser {
    /**
     * Parse file and extract content
     * @param {File} file - File to parse
     * @returns {Promise<ParsedContent>} Parsed content
     * @abstract
     */
    async parse(file) {
        throw new Error('parse() must be implemented by subclass');
    }

    /**
     * Check if parser supports this file
     * @param {File} file - File to check
     * @returns {boolean}
     * @abstract
     */
    supports(file) {
        throw new Error('supports() must be implemented by subclass');
    }
}

/**
 * Parsed content structure
 * @typedef {Object} ParsedContent
 * @property {'text'|'multimodal'} type - Content type
 * @property {string} [text] - Extracted text (for text type)
 * @property {string} [base64] - Base64 encoded file (for multimodal)
 * @property {string} [mimeType] - MIME type (for multimodal)
 * @property {Object} metadata - Additional metadata
 * @property {string} metadata.filename - Original filename
 * @property {number} metadata.size - File size in bytes
 * @property {string} metadata.format - Format type (text|pdf|image|audio|video)
 * @property {number} [metadata.pages] - Number of pages (PDF only)
 * @property {number} [metadata.lastModified] - Last modified timestamp
 */
