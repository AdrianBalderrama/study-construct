/**
 * ParticleSystem - Creates and manages particle-based visual effects
 * 
 * Responsibilities:
 * - Generate sparkle particles for streak celebrations
 * - Create firework explosions
 * - Spawn confetti for perfect scores
 * - Clean up particles after animations complete
 */

export class ParticleSystem {
    constructor() {
        this.activeParticles = new Set();
    }

    /**
     * Create sparkle particles radiating from a target element
     * @param {HTMLElement} target - Element to sparkle from
     * @param {number} count - Number of sparkles to create
     */
    createSparkles(target, count = 12) {
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const particle = this._createParticle('sparkle-particle');
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            // Calculate radial position
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            this._addParticle(particle, 1000);
        }
    }

    /**
     * Create multiple firework explosions
     * @param {number} count - Number of fireworks
     */
    createFireworks(count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = 20 + Math.random() * 60; // 20-80% of screen width
                const y = 20 + Math.random() * 40; // 20-60% of screen height
                this._createFirework(x, y);
            }, i * 200);
        }
    }

    /**
     * Create a single firework explosion at specified position
     * @param {number} x - X position as percentage
     * @param {number} y - Y position as percentage
     * @private
     */
    _createFirework(x, y) {
        const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = this._createParticle('firework-particle');
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            // Calculate explosion trajectory
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            this._addParticle(particle, 1500);
        }
    }

    /**
     * Create confetti rain effect
     * @param {number} count - Number of confetti pieces
     */
    createConfetti(count = 200) {
        const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#ffd43b'];
        const batchSize = 20; // Spawn in batches for better performance

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = this._createParticle('confetti-particle');
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = `${Math.random() * 0.5}s`;
                confetti.style.animationDuration = `${2 + Math.random() * 2}s`;

                this._addParticle(confetti, 4000);
            }, Math.floor(i / batchSize) * 50); // Stagger batches
        }
    }

    /**
     * Create a particle DOM element
     * @param {string} className - CSS class for the particle
     * @returns {HTMLElement}
     * @private
     */
    _createParticle(className) {
        const particle = document.createElement('div');
        particle.className = className;
        return particle;
    }

    /**
     * Add particle to DOM and schedule cleanup
     * @param {HTMLElement} particle - Particle element
     * @param {number} lifetime - Duration before cleanup (ms)
     * @private
     */
    _addParticle(particle, lifetime) {
        document.body.appendChild(particle);
        this.activeParticles.add(particle);

        setTimeout(() => {
            this._removeParticle(particle);
        }, lifetime);
    }

    /**
     * Remove particle from DOM and tracking set
     * @param {HTMLElement} particle - Particle to remove
     * @private
     */
    _removeParticle(particle) {
        if (particle && particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        this.activeParticles.delete(particle);
    }

    /**
     * Clean up all active particles (emergency cleanup)
     */
    cleanup() {
        this.activeParticles.forEach(particle => {
            this._removeParticle(particle);
        });
        this.activeParticles.clear();
    }

    /**
     * Get count of active particles (for debugging/monitoring)
     * @returns {number}
     */
    getActiveCount() {
        return this.activeParticles.size;
    }
}
