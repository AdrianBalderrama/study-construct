/**
 * AnimationController - Manages CSS animations with cleanup and accessibility
 * 
 * Responsibilities:
 * - Apply CSS animations to elements
 * - Handle animation cleanup
 * - Respect prefers-reduced-motion
 * - Provide utility methods for common animations
 */

export class AnimationController {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Listen for changes to motion preference
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
        });
    }

    /**
     * Apply a CSS animation to an element
     * @param {HTMLElement} element - Target element
     * @param {string} animationName - CSS class name for animation
     * @param {number} duration - Duration in milliseconds
     * @param {Function} onComplete - Callback when animation completes
     */
    animate(element, animationName, duration, onComplete) {
        if (!element) {
            console.warn('AnimationController: No element provided');
            onComplete?.();
            return;
        }

        if (this.prefersReducedMotion) {
            onComplete?.();
            return;
        }

        element.classList.add(animationName);

        const cleanup = () => {
            element.classList.remove(animationName);
            onComplete?.();
        };

        setTimeout(cleanup, duration);
    }

    /**
     * Animate a numeric value with easing
     * @param {HTMLElement} element - Element to update
     * @param {number} from - Starting value
     * @param {number} to - Ending value
     * @param {number} duration - Duration in milliseconds
     * @param {Function} formatter - Optional formatter function
     */
    animateValue(element, from, to, duration = 1000, formatter = (val) => val) {
        if (!element) return;

        if (this.prefersReducedMotion) {
            element.textContent = formatter(to);
            return;
        }

        const startTime = performance.now();
        const diff = to - from;

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + diff * easeOut);

            element.textContent = formatter(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }

    /**
     * Check if animations are enabled
     * @returns {boolean}
     */
    isAnimationEnabled() {
        return !this.prefersReducedMotion;
    }
}
