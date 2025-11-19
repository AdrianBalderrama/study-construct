/**
 * MatchingRenderer - Renders matching pairs questions
 * 
 * Responsibilities:
 * - Render left items and right dropdowns
 * - Shuffle right items for challenge
 * - Track user matches
 * - Auto-submit when all matched
 */

export class MatchingRenderer {
    /**
     * Render matching pairs question
     * @param {Object} question - Question object
     * @param {HTMLElement} container - Container element
     * @param {Function} onAnswer - Callback(matchesObject, null)
     */
    render(question, container, onAnswer) {
        container.innerHTML = '';
        container.className = 'matching-container';

        // Shuffle right side for challenge
        const rightItems = question.pairs.map(p => p.right);
        const shuffledRights = this.shuffle([...rightItems]);

        // Track user matches: { leftIndex: rightIndex }
        const matches = {};

        // Create matching rows
        question.pairs.forEach((pair, leftIdx) => {
            const row = document.createElement('div');
            row.className = 'matching-row';

            // Left item
            const leftItem = document.createElement('div');
            leftItem.className = 'matching-left';
            leftItem.textContent = pair.left;

            // Right dropdown
            const select = document.createElement('select');
            select.className = 'matching-select';
            select.setAttribute('aria-label', `Match for ${pair.left}`);

            // Placeholder option
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = '-- Select --';
            select.appendChild(placeholder);

            // Add shuffled options
            shuffledRights.forEach((right, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = right;
                select.appendChild(option);
            });

            // Track selection
            select.onchange = () => {
                const selectedIdx = parseInt(select.value);
                // Find the original index of the selected right item
                const originalIdx = rightItems.indexOf(shuffledRights[selectedIdx]);
                matches[leftIdx] = originalIdx;

                // Auto-submit when all matched
                if (Object.keys(matches).length === question.pairs.length) {
                    onAnswer(matches, null);
                }
            };

            row.appendChild(leftItem);
            row.appendChild(select);
            container.appendChild(row);
        });
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     * @private
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
