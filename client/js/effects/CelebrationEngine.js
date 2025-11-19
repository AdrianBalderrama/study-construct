/**
 * CelebrationEngine - Orchestrates celebration effects based on quiz events
 * 
 * Responsibilities:
 * - Listen to quiz events (correct/incorrect answers)
 * - Determine appropriate celebration level based on streak
 * - Trigger effects via EffectsRenderer
 * - Coordinate perfect score celebrations
 */

export class CelebrationEngine {
    constructor(quizEngine, effectsRenderer) {
        this.quiz = quizEngine;
        this.effects = effectsRenderer;
        this.setupListeners();
    }

    /**
     * Set up event listeners on quiz engine
     * @private
     */
    setupListeners() {
        this.quiz.eventTarget.addEventListener('correct-answer', (e) => {
            this.handleCorrectAnswer(e.detail);
        });

        this.quiz.eventTarget.addEventListener('incorrect-answer', () => {
            this.handleIncorrectAnswer();
        });
    }

    /**
     * Handle correct answer with appropriate celebration
     * @param {Object} detail - Event detail with streak and score
     * @private
     */
    handleCorrectAnswer({ streak, score }) {
        // Base celebration: pulse animation
        this.effects.pulse();

        // Escalating celebrations based on streak
        if (streak === 3) {
            this.effects.sparkle();
            this.effects.showBadge('On Fire! 🔥');
        } else if (streak === 5) {
            this.effects.fireworks();
            this.effects.showBadge('Unstoppable! ⚡');
        } else if (streak > 5) {
            // Intensify for longer streaks
            this.effects.intensifyFireworks();
            if (streak % 3 === 0) {
                this.effects.showBadge(`${streak} Streak! 🌟`);
            }
        }
    }

    /**
     * Handle incorrect answer with subtle feedback
     * @private
     */
    handleIncorrectAnswer() {
        this.effects.shake();
    }

    /**
     * Celebrate perfect score completion
     * Public method called when quiz completes with 100%
     */
    celebratePerfectScore() {
        this.effects.confetti();
        this.effects.showTrophy();
    }

    /**
     * Clean up (if needed for teardown)
     */
    cleanup() {
        // Future: remove event listeners if needed
    }
}
