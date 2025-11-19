import { QuestionRenderer } from './quiz/QuestionRenderer.js';

export class UIManager {
    constructor() {
        this.views = {
            atelier: document.getElementById('view-atelier'),
            workshop: document.getElementById('view-workshop'),
            exam: document.getElementById('view-exam'),
            exhibit: document.getElementById('view-exhibit')
        };

        this.elements = {
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            qCurrent: document.getElementById('q-current'),
            qTotal: document.getElementById('q-total'),
            scoreDisplay: document.getElementById('score-display'),
            finalScore: document.getElementById('final-score-val'),
            settingsModal: document.getElementById('settings-modal'),
            apiKeyInput: document.getElementById('api-key-input'),
            modelIdInput: document.getElementById('model-id-input')
        };

        // Initialize question renderer
        this.questionRenderer = new QuestionRenderer();
    }

    showView(viewName) {
        Object.values(this.views).forEach(el => el.classList.add('hidden'));
        this.views[viewName].classList.remove('hidden');
    }

    renderQuestion(question, onAnswer) {
        this.elements.questionText.textContent = question.question;

        // Use QuestionRenderer for type-aware rendering
        this.questionRenderer.render(
            question,
            this.elements.optionsContainer,
            onAnswer
        );
    }

    updateProgress(progress) {
        this.elements.qCurrent.textContent = String(progress.current).padStart(2, '0');
        this.elements.qTotal.textContent = String(progress.total).padStart(2, '0');
        this.elements.scoreDisplay.textContent = progress.score;
    }

    showResult(score, total) {
        this.elements.finalScore.textContent = `${score} / ${total}`;
        this.showView('exhibit');
    }

    addLog(agentName, type, message) {
        const logContainer = document.getElementById('neural-log');
        if (!logContainer) return;

        const entry = document.createElement('div');
        entry.className = `log-entry log-${type.toLowerCase()}`;
        entry.innerHTML = `
            <span class="log-agent">[${agentName}]</span>
            <span class="log-type">${type}:</span>
            <span class="log-msg">${message}</span>
        `;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    clearLog() {
        const logContainer = document.getElementById('neural-log');
        if (logContainer) logContainer.innerHTML = '';
    }

    toggleSettings(show) {
        if (show) {
            this.elements.settingsModal.classList.remove('hidden');
            this.elements.apiKeyInput.value = localStorage.getItem('sc_token') || '';
            this.elements.modelIdInput.value = localStorage.getItem('sc_model') || 'gemini-2.5-flash';
        } else {
            this.elements.settingsModal.classList.add('hidden');
        }
    }

    markAnswer(btn, isCorrect) {
        if (btn) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }

        // Disable all interactive elements in the container
        const container = this.elements.optionsContainer;
        const buttons = container.querySelectorAll('button');
        const inputs = container.querySelectorAll('input, select');

        buttons.forEach(b => b.disabled = true);
        inputs.forEach(i => i.disabled = true);
    }
}
