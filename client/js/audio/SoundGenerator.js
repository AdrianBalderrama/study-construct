/**
 * SoundGenerator - Procedural sound synthesis using Web Audio API
 * 
 * Responsibilities:
 * - Generate tones using oscillators
 * - Create chords and arpeggios
 * - Provide ascending/descending sequences
 * - Manage AudioContext lifecycle
 * 
 * Design Philosophy:
 * - Geometric sounds matching Bauhaus aesthetic
 * - Simple waveforms (sine, square, triangle)
 * - Short, purposeful sounds
 */

export class SoundGenerator {
    constructor() {
        // Initialize AudioContext (with vendor prefix for Safari)
        this.audioContext = null;
        this.initAudioContext();
    }

    /**
     * Initialize AudioContext (lazy initialization to avoid autoplay issues)
     * @private
     */
    initAudioContext() {
        if (!this.audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            } else {
                console.warn('Web Audio API not supported in this browser');
            }
        }
    }

    /**
     * Resume AudioContext if suspended (required for user interaction)
     * @private
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Play a simple tone
     * @param {string} waveType - 'sine', 'square', 'triangle', 'sawtooth'
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in milliseconds
     * @param {number} volume - Volume 0-1
     */
    async playTone(waveType, frequency, duration, volume = 0.3) {
        if (!this.audioContext) return;

        await this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = waveType;
        oscillator.frequency.value = frequency;

        // Envelope: quick attack, exponential decay
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration / 1000);
    }

    /**
     * Play a chord (multiple frequencies as arpeggio)
     * @param {string} waveType - Oscillator waveform type
     * @param {number[]} frequencies - Array of frequencies in Hz
     * @param {number} duration - Duration in milliseconds
     * @param {number} volume - Volume 0-1
     */
    async playChord(waveType, frequencies, duration, volume = 0.3) {
        if (!this.audioContext) return;

        await this.resumeContext();

        // Play as arpeggio with slight delay between notes
        const noteVolume = volume / Math.sqrt(frequencies.length); // Adjust for multiple notes

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(waveType, freq, duration, noteVolume);
            }, index * 50); // 50ms delay between notes
        });
    }

    /**
     * Play ascending arpeggio (for positive feedback, streaks)
     * @param {number[]} frequencies - Array of frequencies in Hz
     * @param {number} duration - Duration in milliseconds
     * @param {number} volume - Volume 0-1
     */
    async playAscending(frequencies, duration, volume = 0.3) {
        await this.playChord('sine', frequencies, duration, volume);
    }

    /**
     * Play descending sequence (for negative feedback)
     * @param {number[]} frequencies - Array of frequencies in Hz
     * @param {number} duration - Duration in milliseconds
     * @param {number} volume - Volume 0-1
     */
    async playDescending(frequencies, duration, volume = 0.25) {
        if (!this.audioContext) return;

        await this.resumeContext();

        const reversed = [...frequencies].reverse();
        const noteVolume = volume / Math.sqrt(reversed.length);

        reversed.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone('square', freq, duration / 2, noteVolume);
            }, index * 75); // Slightly slower for descending
        });
    }

    /**
     * Play a click sound (UI feedback)
     */
    async playClick() {
        await this.playTone('square', 800, 50, 0.2);
    }

    /**
     * Play a hover sound (UI feedback)
     */
    async playHover() {
        await this.playTone('sine', 600, 30, 0.1);
    }

    /**
     * Check if Web Audio API is supported
     * @returns {boolean}
     */
    isSupported() {
        return !!this.audioContext;
    }

    /**
     * Clean up AudioContext (call when done)
     */
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
