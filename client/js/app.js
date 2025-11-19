import { LLMService } from './LLMService.js';
import { DocumentLoader } from './DocumentLoader.js';
import { QuizEngine } from './QuizEngine.js';
import { UIManager } from './UIManager.js';

// Import celebration system
import { AnimationController } from './effects/AnimationController.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { EffectsRenderer } from './effects/EffectsRenderer.js';
import { CelebrationEngine } from './effects/CelebrationEngine.js';

class App {
    constructor() {
        this.llm = new LLMService();
        this.loader = new DocumentLoader();
        this.engine = new QuizEngine();
        this.ui = new UIManager();

        // Initialize celebration system
        const animator = new AnimationController();
        const particles = new ParticleSystem();
        const effects = new EffectsRenderer(animator, particles);
        this.celebrations = new CelebrationEngine(this.engine, effects);

        this.initListeners();
    }

    initListeners() {
        // Upload
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');

        uploadBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => this.handleFile(e.target.files[0]);

        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        };
        dropZone.ondragleave = () => dropZone.classList.remove('dragover');
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFile(e.dataTransfer.files[0]);
        };

        // Settings
        document.getElementById('settings-btn').onclick = () => this.ui.toggleSettings(true);
        document.getElementById('close-settings').onclick = () => this.ui.toggleSettings(false);
        document.getElementById('save-settings').onclick = () => {
            const token = document.getElementById('api-key-input').value.trim();
            const model = document.getElementById('model-id-input').value.trim();
            this.llm.setCredentials(token, model);
            this.ui.toggleSettings(false);
        };

        // Restart
        document.getElementById('restart-btn').onclick = () => this.ui.showView('atelier');
    }

    async handleFile(file) {
        if (!file) return;

        try {
            this.ui.showView('workshop');
            this.ui.clearLog();

            const text = await this.loader.loadFile(file);

            // Call the Backend API via LLMService
            // The backend now handles the Team/Agent orchestration
            const weaknesses = JSON.parse(localStorage.getItem('sc_weaknesses') || '[]');
            const quizData = await this.llm.generateQuiz(text, weaknesses);

            this.engine.load(quizData);
            this.startQuiz();
        } catch (error) {
            alert(`Error: ${error.message}`);
            this.ui.showView('atelier');
        }
    }

    startQuiz() {
        this.ui.showView('exam');
        this.nextQuestion();
    }

    nextQuestion() {
        const q = this.engine.getCurrentQuestion();
        this.ui.updateProgress(this.engine.getStats());

        this.ui.renderQuestion(q, (idx, btn) => {
            const isCorrect = this.engine.submitAnswer(idx);
            this.ui.markAnswer(btn, isCorrect);

            setTimeout(() => {
                if (this.engine.next()) {
                    this.nextQuestion();
                } else {
                    const final = this.engine.getStats();

                    // Check for perfect score and celebrate
                    if (final.score === final.total) {
                        setTimeout(() => {
                            this.celebrations.celebratePerfectScore();
                        }, 500);
                    }

                    this.ui.showResult(final.score, final.total);
                }
            }, 1000);
        });
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
