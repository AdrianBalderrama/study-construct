export class Memory {
    constructor() {
        this.weaknesses = JSON.parse(localStorage.getItem('sc_weaknesses') || '[]');
    }

    addWeakness(topic) {
        if (!this.weaknesses.includes(topic)) {
            this.weaknesses.push(topic);
            this.save();
        }
    }

    getWeaknesses() {
        return this.weaknesses;
    }

    save() {
        localStorage.setItem('sc_weaknesses', JSON.stringify(this.weaknesses));
    }

    clear() {
        this.weaknesses = [];
        this.save();
    }
}
