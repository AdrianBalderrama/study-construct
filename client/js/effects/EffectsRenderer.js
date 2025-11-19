/**
 * EffectsRenderer - Renders individual visual effects
 * 
 * Responsibilities:
 * - Coordinate animations via AnimationController
 * - Trigger particle effects via ParticleSystem
 * - Create and manage UI elements for badges and modals
 * - Provide high-level effect methods
 */

export class EffectsRenderer {
    constructor(animationController, particleSystem) {
        this.animator = animationController;
        this.particles = particleSystem;
    }

    /**
     * Pulse animation for correct answer
     */
    pulse() {
        const target = document.querySelector('.option-card.correct');
        if (target) {
            this.animator.animate(target, 'pulse', 600);
        }
    }

    /**
     * Shake animation for incorrect answer
     */
    shake() {
        const target = document.querySelector('.option-card.incorrect');
        if (target) {
            this.animator.animate(target, 'shake', 500);
        }
    }

    /**
     * Sparkle effect for 3-question streak
     */
    sparkle() {
        const target = document.querySelector('.option-card.correct');
        if (target) {
            this.particles.createSparkles(target, 12);
        }
    }

    /**
     * Fireworks effect for 5-question streak
     */
    fireworks() {
        this.particles.createFireworks(3);
    }

    /**
     * Intensified fireworks for longer streaks
     */
    intensifyFireworks() {
        this.particles.createFireworks(5);
    }

    /**
     * Full-screen confetti for perfect score
     */
    confetti() {
        this.particles.createConfetti(200);
    }

    /**
     * Display streak badge with text
     * @param {string} text - Badge text to display
     */
    showBadge(text) {
        const badge = document.createElement('div');
        badge.className = 'streak-badge';
        badge.textContent = text;
        badge.setAttribute('role', 'status');
        badge.setAttribute('aria-live', 'polite');

        document.body.appendChild(badge);

        this.animator.animate(badge, 'badge-appear', 2000, () => {
            badge.remove();
        });
    }

    /**
     * Display trophy modal for perfect score
     */
    showTrophy() {
        const trophy = document.createElement('div');
        trophy.className = 'trophy-modal';
        trophy.setAttribute('role', 'dialog');
        trophy.setAttribute('aria-label', 'Perfect Score Achievement');
        trophy.innerHTML = `
            <div class="trophy-content">
                <div class="trophy-icon" aria-hidden="true">🏆</div>
                <h2>Perfect Score!</h2>
                <p>You answered all questions correctly!</p>
            </div>
        `;

        document.body.appendChild(trophy);

        this.animator.animate(trophy, 'trophy-appear', 3000, () => {
            trophy.remove();
        });
    }

    /**
     * Animate score counter
     * @param {HTMLElement} element - Score display element
     * @param {number} from - Starting value
     * @param {number} to - Ending value
     */
    animateScore(element, from, to) {
        this.animator.animateValue(element, from, to, 1000);
    }
}
