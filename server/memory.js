const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'user_memory.json');

class MemoryBank {
    constructor() {
        this.memory = this._loadMemory();
    }

    _loadMemory() {
        try {
            if (fs.existsSync(MEMORY_FILE)) {
                return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
            }
        } catch (error) {
            console.error('Failed to load memory:', error);
        }
        return { users: {} };
    }

    _saveMemory() {
        try {
            fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
        } catch (error) {
            console.error('Failed to save memory:', error);
        }
    }

    getUserMemory(userId) {
        if (!this.memory.users[userId]) {
            this.memory.users[userId] = {
                weaknesses: [],
                topicsStudied: [],
                quizHistory: [],
                lastSession: null
            };
        }

        // Backfill for existing users
        if (!this.memory.users[userId].quizHistory) {
            this.memory.users[userId].quizHistory = [];
        }

        return this.memory.users[userId];
    }

    updateUserWeaknesses(userId, newWeaknesses) {
        const userMem = this.getUserMemory(userId);
        // Add unique new weaknesses
        newWeaknesses.forEach(w => {
            if (!userMem.weaknesses.includes(w)) {
                userMem.weaknesses.push(w);
            }
        });
        userMem.lastSession = new Date().toISOString();
        this._saveMemory();
    }

    recordTopicStudied(userId, topic) {
        const userMem = this.getUserMemory(userId);
        if (!userMem.topicsStudied.includes(topic)) {
            userMem.topicsStudied.push(topic);
        }
        userMem.lastSession = new Date().toISOString();
        this._saveMemory();
    }

    recordQuizResult(userId, result) {
        const userMem = this.getUserMemory(userId);
        // result: { score, total, topic, date }
        userMem.quizHistory.push({
            ...result,
            date: new Date().toISOString()
        });
        userMem.lastSession = new Date().toISOString();
        this._saveMemory();
        return userMem.quizHistory;
    }
}

module.exports = new MemoryBank();
