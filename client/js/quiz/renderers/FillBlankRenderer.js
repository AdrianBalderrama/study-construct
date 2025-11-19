/**
 * FillBlankRenderer - Renders fill-in-the-blank questions
 * 
 * Responsibilities:
 * - Render text input field
 * - Render submit button
 * - Handle Enter key submission
 * - Auto-focus input
 */

export class FillBlankRenderer {
    /**
     * Render fill-in-the-blank question
     * @param {Object} question - Question object
     * @param {HTMLElement} container - Container element
     * @param {Function} onAnswer - Callback(textAnswer, buttonElement)
     */
    render(question, container, onAnswer) {
        container.innerHTML = '';
        container.className = 'fill-blank-container';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'fill-blank-input';
        input.placeholder = 'Type your answer...';
        input.setAttribute('aria-label', 'Answer input');

        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn shape-btn rect-btn';
        submitBtn.textContent = 'SUBMIT';
        submitBtn.onclick = () => {
            if (input.value.trim()) {
                onAnswer(input.value, submitBtn);
            }
        };

        // Allow Enter key to submit
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                submitBtn.click();
            }
        });

        container.appendChild(input);
        container.appendChild(submitBtn);

        // Auto-focus input after render
        setTimeout(() => input.focus(), 100);
    }
}
