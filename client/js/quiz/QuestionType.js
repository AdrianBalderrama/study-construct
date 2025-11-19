/**
 * QuestionType - Question type definitions and detection
 * 
 * Responsibilities:
 * - Define question type constants
 * - Provide type detection for backward compatibility
 * - Centralize type-related logic
 */

/**
 * Question type enumeration
 * @readonly
 * @enum {string}
 */
export const QuestionType = {
    MULTIPLE_CHOICE: 'multiple-choice',
    TRUE_FALSE: 'true-false',
    FILL_BLANK: 'fill-blank',
    MATCHING: 'matching',
    ORDERING: 'ordering'
};

/**
 * Detect question type from question object
 * Provides backward compatibility for questions without explicit type field
 * 
 * @param {Object} question - Question object
 * @returns {string} Question type from QuestionType enum
 */
export function detectQuestionType(question) {
    // Explicit type field (preferred)
    if (question.type && Object.values(QuestionType).includes(question.type)) {
        return question.type;
    }

    // Backward compatibility: infer from structure

    // True/False: has correctAnswer as boolean
    if (question.correctAnswer !== undefined && typeof question.correctAnswer === 'boolean') {
        return QuestionType.TRUE_FALSE;
    }

    // Fill in the Blank: has acceptableAnswers array
    if (question.acceptableAnswers && Array.isArray(question.acceptableAnswers)) {
        return QuestionType.FILL_BLANK;
    }

    // Matching: has pairs array
    if (question.pairs && Array.isArray(question.pairs)) {
        return QuestionType.MATCHING;
    }

    // Ordering: has correctOrder array
    if (question.correctOrder && Array.isArray(question.correctOrder)) {
        return QuestionType.ORDERING;
    }

    // Multiple Choice: has options and correctIndex (default fallback)
    if (question.options && question.correctIndex !== undefined) {
        return QuestionType.MULTIPLE_CHOICE;
    }

    // Ultimate fallback
    console.warn('Could not detect question type, defaulting to multiple-choice:', question);
    return QuestionType.MULTIPLE_CHOICE;
}

/**
 * Validate question structure for a given type
 * @param {Object} question - Question object
 * @param {string} type - Expected question type
 * @returns {boolean} Whether question has valid structure for type
 */
export function validateQuestionStructure(question, type) {
    if (!question || !question.question) {
        return false;
    }

    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            return Array.isArray(question.options) &&
                question.options.length >= 2 &&
                typeof question.correctIndex === 'number' &&
                question.correctIndex >= 0 &&
                question.correctIndex < question.options.length;

        case QuestionType.TRUE_FALSE:
            return typeof question.correctAnswer === 'boolean';

        case QuestionType.FILL_BLANK:
            return typeof question.correctAnswer === 'string' &&
                Array.isArray(question.acceptableAnswers) &&
                question.acceptableAnswers.length > 0;

        case QuestionType.MATCHING:
            return Array.isArray(question.pairs) &&
                question.pairs.length >= 2 &&
                question.pairs.every(p => p.left && p.right);

        case QuestionType.ORDERING:
            return Array.isArray(question.items) &&
                Array.isArray(question.correctOrder) &&
                question.items.length === question.correctOrder.length &&
                question.items.length >= 2;

        default:
            return false;
    }
}
