/**
 * PDFParser - Parse PDF documents using PDF.js
 * 
 * Responsibilities:
 * - Extract text from PDF pages
 * - Handle multi-page documents
 * - Provide page count metadata
 * 
 * Note: Requires PDF.js library to be loaded
 */

import { FormatParser } from '../FormatParser.js';
import { MimeTypeDetector } from '../MimeTypeDetector.js';

export class PDFParser extends FormatParser {
    constructor() {
        super();

        // Check if PDF.js is available
        if (typeof pdfjsLib === 'undefined') {
            console.warn('PDF.js library not loaded. PDF parsing will fail.');
        } else {
            // Set worker path for PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
        }
    }

    supports(file) {
        const format = MimeTypeDetector.detect(file);
        return format === 'pdf';
    }

    async parse(file) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded. Cannot parse PDF files.');
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';
            const numPages = pdf.numPages;

            // Extract text from each page
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                // Concatenate text items
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');

                fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
            }

            return {
                type: 'text',
                text: fullText.trim(),
                metadata: {
                    filename: file.name,
                    size: file.size,
                    format: 'pdf',
                    pages: numPages,
                    lastModified: file.lastModified
                }
            };
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }
}
