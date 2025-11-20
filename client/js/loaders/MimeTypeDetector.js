/**
 * MimeTypeDetector - Detect file format from MIME type and extension
 * 
 * Responsibilities:
 * - Map MIME types to format categories
 * - Provide extension-based fallback detection
 * - Validate file support
 */

export class MimeTypeDetector {
    /**
     * Supported MIME types mapped to format categories
     * @type {Object<string, string>}
     */
    static SUPPORTED_FORMATS = {
        // Text formats
        'text/plain': 'text',
        'text/markdown': 'text',
        'text/csv': 'text',
        'application/json': 'text',

        // PDF
        'application/pdf': 'pdf',

        // Images
        'image/jpeg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'image/webp': 'image',
        'image/bmp': 'image',
        'image/svg+xml': 'image',

        // Audio
        'audio/mpeg': 'audio',
        'audio/wav': 'audio',
        'audio/mp4': 'audio',
        'audio/ogg': 'audio',
        'audio/flac': 'audio',
        'audio/webm': 'audio',

        // Video
        'video/mp4': 'video',
        'video/webm': 'video',
        'video/quicktime': 'video',
        'video/x-msvideo': 'video',
        'video/mpeg': 'video'
    };

    /**
     * File extension to format mapping (fallback)
     * @type {Object<string, string>}
     */
    static EXTENSION_MAP = {
        // Text
        txt: 'text',
        md: 'text',
        markdown: 'text',
        csv: 'text',
        json: 'text',

        // PDF
        pdf: 'pdf',

        // Images
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        webp: 'image',
        bmp: 'image',
        svg: 'image',

        // Audio
        mp3: 'audio',
        wav: 'audio',
        m4a: 'audio',
        ogg: 'audio',
        oga: 'audio',
        flac: 'audio',

        // Video
        mp4: 'video',
        webm: 'video',
        mov: 'video',
        avi: 'video',
        mpeg: 'video',
        mpg: 'video'
    };

    /**
     * Detect format type from file
     * @param {File} file - File object
     * @returns {string} Format type (text|pdf|image|audio|video|unsupported)
     */
    static detect(file) {
        // Primary: Use MIME type
        if (file.type && this.SUPPORTED_FORMATS[file.type]) {
            return this.SUPPORTED_FORMATS[file.type];
        }

        // Fallback: Use file extension
        const ext = this.getExtension(file.name);
        return this.detectByExtension(ext);
    }

    /**
     * Detect format by file extension
     * @param {string} extension - File extension (without dot)
     * @returns {string} Format type
     */
    static detectByExtension(extension) {
        const ext = extension.toLowerCase();
        return this.EXTENSION_MAP[ext] || 'unsupported';
    }

    /**
     * Get file extension from filename
     * @param {string} filename - File name
     * @returns {string} Extension without dot
     */
    static getExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    /**
     * Check if file is supported
     * @param {File} file - File object
     * @returns {boolean}
     */
    static isSupported(file) {
        return this.detect(file) !== 'unsupported';
    }

    /**
     * Get human-readable format name
     * @param {string} format - Format type
     * @returns {string} Human-readable name
     */
    static getFormatName(format) {
        const names = {
            text: 'Text Document',
            pdf: 'PDF Document',
            image: 'Image',
            audio: 'Audio File',
            video: 'Video File',
            unsupported: 'Unsupported Format'
        };
        return names[format] || 'Unknown Format';
    }

    /**
     * Get accept attribute value for file input
     * @returns {string} Comma-separated list of extensions
     */
    static getAcceptAttribute() {
        const extensions = Object.keys(this.EXTENSION_MAP).map(ext => `.${ext}`);
        return extensions.join(',');
    }
}
