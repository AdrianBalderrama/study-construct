/**
 * TrueFalseRenderer - Renders true/false questions
 * 
 * Responsibilities:
 * - Render TRUE/FALSE buttons
 * - Handle boolean selection
 * - Bauhaus-styled button layout
 */

export class TrueFalseRenderer {
    /**
     * Render true/false question
     * @param {Object} question - Question object
     * @param {HTMLElement} container - Container element
     * @param {Function} onAnswer - Callback(booleanAnswer, buttonElement)
     */
    render(question, container, onAnswer) {
        container.innerHTML = '';
        container.className = 'true-false-container';

        const trueBtn = this.createButton('TRUE', true, onAnswer);
        const falseBtn = this.createButton('FALSE', false, onAnswer);

        container.appendChild(trueBtn);
        container.appendChild(falseBtn);
    }

    /**
     * Create a true/false button
     * @param {string} text - Button text
     * @param {boolean} value - Boolean value
     * @param {Function} onAnswer - Answer callback
     * @returns {HTMLElement}
     * @private
     */
    createButton(text, value, onAnswer) {
        const btn = document.createElement('button');
        btn.className = 'true-false-btn';
        btn.textContent = text;
        btn.onclick = () => onAnswer(value, btn);
        return btn;
    }
}
