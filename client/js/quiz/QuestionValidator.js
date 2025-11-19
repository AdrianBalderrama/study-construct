/**
 * QuestionValidator - Type-specific answer validation
 * 
 * Responsibilities:
 * - Validate user answers based on question type
 * - Provide consistent validation interface
 * - Handle edge cases and normalization
 */

import { QuestionType, detectQuestionType } from './QuestionType.js';

export class QuestionValidator {
    /**
     * Validate answer based on question type
     * @param {Object} question - Question object
     * @param {*} userAnswer - User's answer (type varies by question type)
     * @returns {boolean} Whether answer is correct
     */
    static validate(question, userAnswer) {
        const type = detectQuestionType(question);

        switch (type) {
            case QuestionType.MULTIPLE_CHOICE:
                return this.validateMultipleChoice(question, userAnswer);
            case QuestionType.TRUE_FALSE:
                return this.validateTrueFalse(question, userAnswer);
            case QuestionType.FILL_BLANK:
                return this.validateFillBlank(question, userAnswer);
            case QuestionType.MATCHING:
                return this.validateMatching(question, userAnswer);
            case QuestionType.ORDERING:
                return this.validateOrdering(question, userAnswer);
            default:
                console.warn(`Unknown question type: ${type}`);
                return false;
        }
    }

    /**
     * Validate multiple choice answer
     * @param {Object} question
     * @param {number} answerIndex - Selected option index
     * @returns {boolean}
     */
    static validateMultipleChoice(question, answerIndex) {
        return answerIndex === question.correctIndex;
    }

    /**
     * Validate true/false answer
     * @param {Object} question
     * @param {boolean} answer - Selected true/false value
     * @returns {boolean}
     */
    static validateTrueFalse(question, answer) {
        return answer === question.correctAnswer;
    }

    /**
     * Validate fill-in-the-blank answer
     * @param {Object} question
     * @param {string} answer - User's text input
     * @returns {boolean}
     */
    static validateFillBlank(question, answer) {
        if (typeof answer !== 'string') {
            return false;
        }

        const caseSensitive = question.caseSensitive !== false; // Default true
        const userAnswer = caseSensitive
            ? answer.trim()
            : answer.trim().toLowerCase();

        const acceptable = question.acceptableAnswers.map(a =>
            caseSensitive ? a.trim() : a.trim().toLowerCase()
        );

        return acceptable.includes(userAnswer);
    }

    /**
     * Validate matching pairs answer
     * @param {Object} question
     * @param {Object} userMatches - Map of left index to right index
     * @returns {boolean}
     */
    static validateMatching(question, userMatches) {
        if (!userMatches || typeof userMatches !== 'object') {
            return false;
        }

        // Check if all pairs are matched
        if (Object.keys(userMatches).length !== question.pairs.length) {
            return false;
        }

        // Validate each match
        // Note: In the renderer, right items are shuffled, so we need to check
        // if the user matched each left item to its corresponding right item
        return question.pairs.every((pair, leftIndex) => {
            const userRightIndex = userMatches[leftIndex];
            if (userRightIndex === undefined) return false;

            // The user's selection should match the original pair
            return userRightIndex === leftIndex;
        });
    }

    /**
     * Validate ordering answer
     * @param {Object} question
     * @param {number[]} userOrder - Array of item indices in user's order
     * @returns {boolean}
     */
    static validateOrdering(question, userOrder) {
        if (!Array.isArray(userOrder)) {
            return false;
        }

        if (userOrder.length !== question.correctOrder.length) {
            return false;
        }

        // Compare arrays element by element
        return userOrder.every((item, index) => item === question.correctOrder[index]);
    }
}
