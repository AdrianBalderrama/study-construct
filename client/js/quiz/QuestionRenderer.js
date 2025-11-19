/**
 * QuestionRenderer - Orchestrates rendering of different question types
 * 
 * Responsibilities:
 * - Detect question type
 * - Delegate to appropriate renderer
 * - Provide unified rendering interface
 */

import { QuestionType, detectQuestionType } from './QuestionType.js';
import { MultipleChoiceRenderer } from './renderers/MultipleChoiceRenderer.js';
import { TrueFalseRenderer } from './renderers/TrueFalseRenderer.js';
import { FillBlankRenderer } from './renderers/FillBlankRenderer.js';
import { MatchingRenderer } from './renderers/MatchingRenderer.js';
import { OrderingRenderer } from './renderers/OrderingRenderer.js';

export class QuestionRenderer {
    constructor() {
        // Initialize all renderers
        this.renderers = {
            [QuestionType.MULTIPLE_CHOICE]: new MultipleChoiceRenderer(),
            [QuestionType.TRUE_FALSE]: new TrueFalseRenderer(),
            [QuestionType.FILL_BLANK]: new FillBlankRenderer(),
            [QuestionType.MATCHING]: new MatchingRenderer(),
            [QuestionType.ORDERING]: new OrderingRenderer()
        };
    }

    /**
     * Render question based on its type
     * @param {Object} question - Question object
     * @param {HTMLElement} container - Container element
     * @param {Function} onAnswer - Callback when user answers
     */
    render(question, container, onAnswer) {
        const type = detectQuestionType(question);
        const renderer = this.renderers[type];

        if (!renderer) {
            console.error(`No renderer found for question type: ${type}`);
            this.renderError(container, `Unsupported question type: ${type}`);
            return;
        }

        try {
            renderer.render(question, container, onAnswer);
        } catch (error) {
            console.error(`Error rendering question of type ${type}:`, error);
            this.renderError(container, 'Failed to render question');
        }
    }

    /**
     * Render error message
     * @param {HTMLElement} container - Container element
     * @param {string} message - Error message
     * @private
     */
    renderError(container, message) {
        container.innerHTML = '';
        container.className = 'question-error';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `⚠️ ${message}`;
        errorDiv.style.padding = '2rem';
        errorDiv.style.background = 'var(--color-red)';
        errorDiv.style.color = 'white';
        errorDiv.style.border = '4px solid var(--color-black)';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.textAlign = 'center';

        container.appendChild(errorDiv);
    }
}
