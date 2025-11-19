export class QuizEngine {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
    }

    load(questions) {
        this.questions = questions;
        this.currentIndex = 0;
        this.score = 0;
    }

    getCurrentQuestion() {
        return this.questions[this.currentIndex];
    }

    submitAnswer(index) {
        const q = this.getCurrentQuestion();
        const isCorrect = index === q.correctIndex;
        if (isCorrect) this.score++;
        return isCorrect;
    }

    next() {
        this.currentIndex++;
        return this.currentIndex < this.questions.length;
    }

    getProgress() {
        return {
            current: this.currentIndex + 1,
            total: this.questions.length,
            score: this.score
        };
    }
}
