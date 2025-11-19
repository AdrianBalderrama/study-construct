/**
 * CelebrationEngine - Orchestrates celebration effects based on quiz events
 * 
 * Responsibilities:
 * - Listen to quiz events (correct/incorrect answers)
 * - Determine appropriate celebration level based on streak
 * - Trigger effects via EffectsRenderer
 * - Trigger audio via AudioManager
 * - Coordinate perfect score celebrations
 */

export class CelebrationEngine {
    constructor(quizEngine, effectsRenderer, audioManager) {
        this.quiz = quizEngine;
        this.effects = effectsRenderer;
        this.audio = audioManager;
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
        // Base celebration: pulse animation + sound
        this.effects.pulse();

        // Escalating celebrations based on streak
        if (streak === 1) {
            // Single correct answer
            this.audio.playCorrectWithStreak(streak);
        } else if (streak === 3) {
            // 3-streak celebration
            this.effects.sparkle();
            this.effects.showBadge('On Fire! 🔥');
            this.audio.play('streak3');
        } else if (streak === 5) {
            // 5-streak celebration
            this.effects.fireworks();
            this.effects.showBadge('Unstoppable! ⚡');
            this.audio.play('streak5');
        } else if (streak > 5) {
            // Intensify for longer streaks
            this.effects.intensifyFireworks();
            this.audio.playCorrectWithStreak(streak);

            if (streak % 3 === 0) {
                this.effects.showBadge(`${streak} Streak! 🌟`);
            }
        } else {
            // 2 or 4 streak (no special celebration, just progressive sound)
            this.audio.playCorrectWithStreak(streak);
        }
    }

    /**
     * Handle incorrect answer with subtle feedback
     * @private
     */
    handleIncorrectAnswer() {
        this.effects.shake();
        this.audio.play('incorrect');
    }

    /**
     * Celebrate perfect score completion
     * Public method called when quiz completes with 100%
     */
    celebratePerfectScore() {
        this.effects.confetti();
        this.effects.showTrophy();
        this.audio.play('victory');
    }

    /**
     * Clean up (if needed for teardown)
     */
    cleanup() {
        // Future: remove event listeners if needed
    }
}
