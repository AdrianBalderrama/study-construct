/**
 * QuizEngine - Manages quiz state and logic
 * Enhanced with streak tracking, event emission, and advanced question types
 */

import { QuestionValidator } from './quiz/QuestionValidator.js';

export class QuizEngine {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.eventTarget = new EventTarget();
    }

    load(questions) {
        this.questions = questions;
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
    }

    getCurrentQuestion() {
        return this.questions[this.currentIndex];
    }

    submitAnswer(answer) {
        const q = this.getCurrentQuestion();
        const isCorrect = QuestionValidator.validate(q, answer);

        if (isCorrect) {
            this.score++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);

            // Emit celebration event with streak data
            this.eventTarget.dispatchEvent(new CustomEvent('correct-answer', {
                detail: {
                    streak: this.streak,
                    score: this.score,
                    questionIndex: this.currentIndex
                }
            }));
        } else {
            this.streak = 0;

            // Emit incorrect answer event
            this.eventTarget.dispatchEvent(new CustomEvent('incorrect-answer', {
                detail: {
                    questionIndex: this.currentIndex
                }
            }));
        }

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

    /**
     * Get comprehensive stats including streak information
     * @returns {Object} Stats object with current, total, score, streak, maxStreak
     */
    getStats() {
        return {
            current: this.currentIndex + 1,
            total: this.questions.length,
            score: this.score,
            streak: this.streak,
            maxStreak: this.maxStreak
        };
    }

    /**
     * Check if current quiz is a perfect score
     * @returns {boolean}
     */
    isPerfectScore() {
        return this.score === this.questions.length && this.currentIndex === this.questions.length - 1;
    }
}
