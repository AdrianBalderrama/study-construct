import { LLMService } from './LLMService.js';
import { DocumentLoader } from './loaders/DocumentLoader.js';
import { QuizEngine } from './QuizEngine.js';
import { UIManager } from './UIManager.js';

// Import celebration system
import { AnimationController } from './effects/AnimationController.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { EffectsRenderer } from './effects/EffectsRenderer.js';
import { CelebrationEngine } from './effects/CelebrationEngine.js';

// Import audio system
import { SoundGenerator } from './audio/SoundGenerator.js';
import { AudioManager } from './audio/AudioManager.js';
import { AudioSettings } from './audio/AudioSettings.js';

class App {
    constructor() {
        this.llm = new LLMService();
        this.loader = new DocumentLoader();
        this.engine = new QuizEngine();
        this.ui = new UIManager();

        // Initialize audio system
        const soundGen = new SoundGenerator();
        this.audioManager = new AudioManager(soundGen);

        // Initialize celebration system with audio
        const animator = new AnimationController();
        const particles = new ParticleSystem();
        const effects = new EffectsRenderer(animator, particles);
        this.celebrations = new CelebrationEngine(this.engine, effects, this.audioManager);

        this.initListeners();
        this.initAudioUI();
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

    initAudioUI() {
        // Initialize audio settings UI
        new AudioSettings(this.audioManager);

        // Add UI sound effects after a short delay to ensure DOM is ready
        setTimeout(() => this.addUISounds(), 100);
    }

    addUISounds() {
        // Add click sounds to all buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    this.audioManager.play('click');
                }
            });
        });

        // Add hover sounds to option cards (will be added dynamically during quiz)
        // This is handled in the renderQuestion method via event delegation
    }

    async handleFile(file) {
        if (!file) return;

        try {
            this.ui.showView('workshop');
            this.ui.clearLog();
            this.ui.addLog('System', 'INFO', `Loading file: ${file.name}`);

            // Parse file with new DocumentLoader
            const parsedContent = await this.loader.loadFile(file);

            // Show format-specific feedback
            if (parsedContent.type === 'multimodal') {
                this.ui.addLog('System', 'INFO',
                    `Processing ${parsedContent.metadata.format} file with Gemini AI...`);
            } else {
                this.ui.addLog('System', 'INFO',
                    `Extracted ${parsedContent.text.length} characters from ${parsedContent.metadata.format} file`);
            }

            // Generate quiz with parsed content
            const weaknesses = JSON.parse(localStorage.getItem('sc_weaknesses') || '[]');
            const quizData = await this.llm.generateQuiz(parsedContent, weaknesses);

            this.engine.load(quizData);
            this.startQuiz();
        } catch (error) {
            console.error('Error:', error);
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
