/**
 * AudioSettings - UI controls for audio preferences
 * 
 * Responsibilities:
 * - Provide toggle for enable/disable
 * - Provide volume slider
 * - Provide test sound button
 * - Update UI based on current state
 * - Persist changes via AudioManager
 */

export class AudioSettings {
    constructor(audioManager) {
        this.audio = audioManager;
        this.elements = {};
        this.initUI();
        this.attachListeners();
    }

    /**
     * Initialize audio settings UI in the settings modal
     */
    initUI() {
        const settingsBody = document.querySelector('.modal-body');
        if (!settingsBody) {
            console.warn('AudioSettings: Settings modal not found');
            return;
        }

        // Create audio settings section
        const audioSection = document.createElement('div');
        audioSection.className = 'audio-settings-section';
        audioSection.innerHTML = `
            <h4 class="audio-settings-title">AUDIO SETTINGS</h4>
            
            <label class="audio-toggle-label">
                <input type="checkbox" id="audio-toggle" ${this.audio.isEnabled() ? 'checked' : ''}>
                <span>Enable Sound Effects</span>
            </label>
            
            <label class="volume-label">
                <span>Volume</span>
                <input type="range" id="volume-slider" 
                       min="0" max="1" step="0.1" 
                       value="${this.audio.getVolume()}"
                       ${!this.audio.isEnabled() ? 'disabled' : ''}>
                <span id="volume-value">${Math.round(this.audio.getVolume() * 100)}%</span>
            </label>
            
            <button id="test-sound-btn" class="shape-btn rect-btn test-sound-btn" 
                    ${!this.audio.isEnabled() ? 'disabled' : ''}>
                TEST SOUND
            </button>
            
            ${!this.audio.isSupported() ? '<p class="audio-warning">⚠️ Web Audio API not supported in this browser</p>' : ''}
        `;

        settingsBody.appendChild(audioSection);

        // Cache element references
        this.elements = {
            toggle: document.getElementById('audio-toggle'),
            slider: document.getElementById('volume-slider'),
            volumeValue: document.getElementById('volume-value'),
            testBtn: document.getElementById('test-sound-btn')
        };
    }

    /**
     * Attach event listeners to UI controls
     */
    attachListeners() {
        if (!this.elements.toggle) return;

        // Toggle enable/disable
        this.elements.toggle.addEventListener('change', (e) => {
            this.audio.setEnabled(e.target.checked);
            this.updateUI();

            // Play a test sound when enabling
            if (e.target.checked) {
                setTimeout(() => this.audio.play('correct'), 100);
            }
        });

        // Volume slider
        this.elements.slider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.audio.setVolume(volume);
            this.elements.volumeValue.textContent = `${Math.round(volume * 100)}%`;
        });

        // Test sound button
        this.elements.testBtn.addEventListener('click', () => {
            this.audio.play('correct');
        });
    }

    /**
     * Update UI state based on audio enabled/disabled
     */
    updateUI() {
        const enabled = this.audio.isEnabled();
        this.elements.slider.disabled = !enabled;
        this.elements.testBtn.disabled = !enabled;
    }
}
