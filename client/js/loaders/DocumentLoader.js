/**
 * DocumentLoader - Main orchestrator for document loading and parsing
 * 
 * Responsibilities:
 * - Detect file format
 * - Delegate to appropriate parser
 * - Validate file size
 * - Provide unified interface
 */

import { MimeTypeDetector } from './MimeTypeDetector.js';
import { TextParser } from './parsers/TextParser.js';
import { PDFParser } from './parsers/PDFParser.js';
import { ImageParser } from './parsers/ImageParser.js';
import { AudioParser } from './parsers/AudioParser.js';
import { VideoParser } from './parsers/VideoParser.js';

export class DocumentLoader {
    /**
     * File size limits in bytes
     * @type {Object<string, number>}
     */
    static FILE_SIZE_LIMITS = {
        text: 10 * 1024 * 1024,    // 10 MB
        pdf: 20 * 1024 * 1024,     // 20 MB
        image: 5 * 1024 * 1024,    // 5 MB
        audio: 20 * 1024 * 1024,   // 20 MB
        video: 50 * 1024 * 1024    // 50 MB
    };

    constructor() {
        // Initialize all parsers
        this.parsers = [
            new TextParser(),
            new PDFParser(),
            new ImageParser(),
            new AudioParser(),
            new VideoParser()
        ];
    }

    /**
     * Load and parse file
     * @param {File} file - File to load
     * @returns {Promise<ParsedContent>}
     * @throws {Error} If file is unsupported or too large
     */
    async loadFile(file) {
        // Validate file support
        if (!MimeTypeDetector.isSupported(file)) {
            const format = MimeTypeDetector.detect(file);
            throw new Error(
                `Unsupported file type: ${MimeTypeDetector.getFormatName(format)}. ` +
                `Please upload a supported format.`
            );
        }

        // Validate file size
        const format = MimeTypeDetector.detect(file);
        const sizeLimit = DocumentLoader.FILE_SIZE_LIMITS[format];

        if (file.size > sizeLimit) {
            const limitMB = (sizeLimit / (1024 * 1024)).toFixed(0);
            const fileMB = (file.size / (1024 * 1024)).toFixed(2);
            throw new Error(
                `File too large: ${fileMB} MB. ` +
                `Maximum size for ${format} files is ${limitMB} MB.`
            );
        }

        // Find appropriate parser
        const parser = this.parsers.find(p => p.supports(file));

        if (!parser) {
            throw new Error(`No parser found for file type: ${file.type || file.name}`);
        }

        // Parse file
        try {
            const content = await parser.parse(file);
            console.log(`Successfully parsed ${format} file:`, file.name);
            return content;
        } catch (error) {
            console.error('File parsing error:', error);
            throw new Error(`Failed to parse file: ${error.message}`);
        }
    }

    /**
     * Get supported file extensions for file input accept attribute
     * @returns {string} Comma-separated list of extensions
     */
    getSupportedExtensions() {
        return MimeTypeDetector.getAcceptAttribute();
    }

    /**
     * Get human-readable list of supported formats
     * @returns {string[]} Array of format names
     */
    getSupportedFormats() {
        return [
            'Text files (.txt, .md, .csv, .json)',
            'PDF documents (.pdf)',
            'Images (.jpg, .png, .gif, .webp, .bmp)',
            'Audio files (.mp3, .wav, .m4a, .ogg, .flac)',
            'Video files (.mp4, .webm, .mov, .avi)'
        ];
    }
}
