const readline = require('readline');
const { Team } = require('./server/agent');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🤖 Auto Study Agent CLI 🤖");
console.log("--------------------------------");
console.log("This CLI allows you to interactively test the agent team.");
console.log("You will act as the user providing a document.");
console.log("The agents will then: Research -> Review -> Generate Quiz.\n");

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function run() {
    try {
        // 1. Configuration
        const token = process.env.GOOGLE_API_KEY || await ask("Enter Google API Key (or press enter if set in env): ");
        const modelId = "gemini-2.5-flash";

        if (!token) {
            console.error("❌ API Key is required.");
            process.exit(1);
        }

        // 2. Input Document
        console.log("\n📝 Enter the text you want to study (press Enter twice to finish):");
        let documentText = "";
        for await (const line of rl) {
            if (line.trim() === "") break;
            documentText += line + "\n";
        }

        if (!documentText.trim()) {
            documentText = "Artificial Intelligence is the simulation of human intelligence processes by machines.";
            console.log(`\n⚠️ No input provided. Using default text:\n"${documentText}"`);
        }

        // 3. Initialize Team
        console.log("\n⚙️ Initializing Agent Team...");
        const team = new Team(token, modelId, documentText, ["General Knowledge"]);

        // 4. Run Research Phase
        console.log("\n🔍 Phase 1: Researching...");
        const facts = await team.runResearch((agent, type, msg) => {
            // Colorize output
            const color = agent === 'Researcher' ? '\x1b[36m' : '\x1b[33m'; // Cyan or Yellow
            const reset = '\x1b[0m';

            // Parse msg if it's JSON
            let cleanMsg = msg;
            try {
                const parsed = JSON.parse(msg);
                if (parsed.content && parsed.content.parts) {
                    cleanMsg = parsed.content.parts.map(p => p.text).join('');
                }
            } catch (e) { }

            console.log(`${color}[${agent}]${reset} ${cleanMsg}`);
        });

        console.log("\n✅ Research Complete. Extracted Facts:");
        console.log(facts);

        // 5. Human-in-the-Loop Review
        const proceed = await ask("\n❓ Do these facts look good? (y/n): ");
        if (proceed.toLowerCase() !== 'y') {
            console.log("❌ Aborted by user.");
            process.exit(0);
        }

        // 6. Run Generation Phase
        console.log("\n✍️ Phase 2: Generating Quiz (Parallel Examiners)...");
        const quiz = await team.generateQuizFromFacts(facts, (agent, type, msg) => {
            const color = '\x1b[35m'; // Magenta
            const reset = '\x1b[0m';
            console.log(`${color}[${type}]${reset} ${msg}`);
        });

        console.log("\n🎉 Quiz Generated!");
        console.log(JSON.stringify(quiz, null, 2));

    } catch (error) {
        console.error("\n❌ Error:", error);
    } finally {
        rl.close();
    }
}

run();
