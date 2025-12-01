const { Team } = require('./server/agent');

async function testAgentPipeline() {
    console.log("Starting Agent Pipeline Test...");

    const mockToken = "test-token";
    const mockModelId = "gemini-2.5-flash";
    const mockText = "Artificial Intelligence is a field of computer science.";
    const mockWeaknesses = ["AI History"];

    const team = new Team(mockToken, mockModelId, mockText, mockWeaknesses);

    console.log("1. Testing Memory Loading...");
    // This happens inside generateQuiz, so we'll see it in logs

    console.log("2. Testing Parallel Agents & Loop...");
    try {
        const quiz = await team.generateQuiz((agent, type, msg) => {
            console.log(`[${agent}] ${type}: ${msg}`);
        });

        console.log("\n--- Final Quiz Output ---");
        console.log(JSON.stringify(quiz, null, 2));

        if (quiz.length === 3) {
            console.log("\n✅ SUCCESS: Generated 3 questions from parallel agents.");
        } else {
            console.log("\n❌ FAILURE: Expected 3 questions, got " + quiz.length);
        }

    } catch (error) {
        console.error("\n❌ ERROR:", error);
    }
}

testAgentPipeline();
