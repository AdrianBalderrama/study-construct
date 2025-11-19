/**
 * OrderingRenderer - Renders ordering/sequencing questions
 * 
 * Responsibilities:
 * - Render draggable items
 * - Implement drag-and-drop functionality
 * - Track item order
 * - Provide submit button
 */

export class OrderingRenderer {
    /**
     * Render ordering question
     * @param {Object} question - Question object
     * @param {HTMLElement} container - Container element
     * @param {Function} onAnswer - Callback(orderArray, buttonElement)
     */
    render(question, container, onAnswer) {
        container.innerHTML = '';
        container.className = 'ordering-container';

        // Shuffle items for challenge
        const shuffledItems = this.shuffle(
            question.items.map((item, idx) => ({ item, originalIdx: idx }))
        );

        // Create draggable list
        const list = document.createElement('div');
        list.className = 'ordering-list';

        shuffledItems.forEach((shuffled, displayIdx) => {
            const item = this.createDraggableItem(shuffled.item, shuffled.originalIdx);
            list.appendChild(item);
        });

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn shape-btn rect-btn';
        submitBtn.textContent = 'SUBMIT ORDER';
        submitBtn.onclick = () => {
            const finalOrder = this.getCurrentOrder(list);
            onAnswer(finalOrder, submitBtn);
        };

        container.appendChild(list);
        container.appendChild(submitBtn);

        // Enable drag and drop
        this.enableDragDrop(list);
    }

    /**
     * Create a draggable item element
     * @param {string} text - Item text
     * @param {number} originalIndex - Original index in question.items
     * @returns {HTMLElement}
     * @private
     */
    createDraggableItem(text, originalIndex) {
        const item = document.createElement('div');
        item.className = 'ordering-item';
        item.textContent = text;
        item.draggable = true;
        item.dataset.originalIndex = originalIndex;
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Draggable item: ${text}`);
        return item;
    }

    /**
     * Enable drag and drop functionality
     * @param {HTMLElement} list - List container
     * @private
     */
    enableDragDrop(list) {
        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('ordering-item')) {
                draggedItem = e.target;
                e.target.classList.add('dragging');
            }
        });

        list.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('ordering-item')) {
                e.target.classList.remove('dragging');
            }
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(list, e.clientY);
            if (draggedItem) {
                if (afterElement == null) {
                    list.appendChild(draggedItem);
                } else {
                    list.insertBefore(draggedItem, afterElement);
                }
            }
        });
    }

    /**
     * Get the element that should come after the dragged element
     * @param {HTMLElement} container - List container
     * @param {number} y - Mouse Y position
     * @returns {HTMLElement|null}
     * @private
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.ordering-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Get current order of items
     * @param {HTMLElement} list - List container
     * @returns {number[]} Array of original indices in current order
     * @private
     */
    getCurrentOrder(list) {
        return [...list.querySelectorAll('.ordering-item')].map(item =>
            parseInt(item.dataset.originalIndex)
        );
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
