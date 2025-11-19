/**
 * AudioManager - Orchestrates sound playback and user preferences
 * 
 * Responsibilities:
 * - Manage sound library
 * - Control enable/disable state
 * - Manage master volume
 * - Persist user preferences
 * - Provide high-level sound playback methods
 */

export class AudioManager {
    constructor(soundGenerator) {
        this.generator = soundGenerator;

        // Load preferences from localStorage (default: disabled)
        this.enabled = localStorage.getItem('sc_audio_enabled') === 'true';
        this.volume = parseFloat(localStorage.getItem('sc_audio_volume')) || 0.7;

        // Musical notes (C major scale)
        this.notes = {
            C4: 261.63,
            E4: 329.63,
            G4: 392.00,
            C5: 523.25,
            E5: 659.25,
            G5: 783.99,
            B5: 987.77,
            C6: 1046.50
        };

        // Sound library definitions
        this.sounds = {
            // UI Interactions
            click: () => this.generator.playTone('square', 800, 50, 0.2 * this.volume),
            hover: () => this.generator.playTone('sine', 600, 30, 0.1 * this.volume),

            // Quiz Feedback
            correct: () => this.generator.playChord('sine',
                [this.notes.C5, this.notes.E5, this.notes.G5],
                200, 0.3 * this.volume),

            incorrect: () => this.generator.playDescending(
                [400, 350],
                150, 0.25 * this.volume),

            // Streak Celebrations
            streak3: () => this.generator.playAscending(
                [this.notes.E5, this.notes.G5, this.notes.B5],
                300, 0.35 * this.volume),

            streak5: () => this.generator.playAscending(
                [this.notes.C5, this.notes.E5, this.notes.G5, this.notes.B5, this.notes.C6],
                400, 0.4 * this.volume),

            // Perfect Score
            victory: () => this.generator.playAscending(
                [this.notes.C5, this.notes.E5, this.notes.G5, this.notes.C6],
                600, 0.45 * this.volume)
        };
    }

    /**
     * Play a named sound from the library
     * @param {string} soundName - Name of the sound to play
     */
    play(soundName) {
        if (!this.enabled) return;
        if (!this.generator.isSupported()) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound();
        } else {
            console.warn(`AudioManager: Sound "${soundName}" not found`);
        }
    }

    /**
     * Play correct answer sound with progressive pitch based on streak
     * @param {number} streakCount - Current streak count
     */
    playCorrectWithStreak(streakCount) {
        if (!this.enabled) return;
        if (!this.generator.isSupported()) return;

        // Increase pitch slightly for each streak (max 50% increase)
        const basePitch = this.notes.C5;
        const pitchMultiplier = 1 + Math.min(streakCount * 0.05, 0.5);
        const frequency = basePitch * pitchMultiplier;

        this.generator.playTone('sine', frequency, 150, 0.3 * this.volume);
    }

    /**
     * Enable or disable audio
     * @param {boolean} enabled - True to enable, false to disable
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('sc_audio_enabled', enabled.toString());
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level 0-1
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sc_audio_volume', this.volume.toString());
    }

    /**
     * Toggle audio on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }

    /**
     * Check if audio is currently enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Get current volume level
     * @returns {number} Volume 0-1
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Check if Web Audio API is supported
     * @returns {boolean}
     */
    isSupported() {
        return this.generator.isSupported();
    }
}
