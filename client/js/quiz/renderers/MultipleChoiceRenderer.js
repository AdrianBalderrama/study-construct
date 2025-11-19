/**
 * MultipleChoiceRenderer - Renders multiple choice questions
 * 
 * Responsibilities:
 * - Render option buttons in grid layout
 * - Handle option selection
 * - Maintain existing UI patterns
 */

export class MultipleChoiceRenderer {
    /**
     * Render multiple choice question
     * @param {Object} question - Question object
     * @param {HTMLElement} container - Container element
     * @param {Function} onAnswer - Callback(answerIndex, buttonElement)
     */
    render(question, container, onAnswer) {
        container.innerHTML = '';
        container.className = 'options-grid';

        question.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-card';
            btn.textContent = opt;
            btn.onclick = () => onAnswer(idx, btn);
            container.appendChild(btn);
        });
    }
}
