import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
async function run() {
  for (const model of ["claude-sonnet-5-5", "claude-haiku-4-5", "gemini-1.5-pro"]) {
    try {
      console.log("Testing:", model);
      await anthropic.messages.create({
        model, max_tokens: 10, messages: [{ role: "user", content: "Hi" }]
      });
      console.log("SUCCESS:", model);
    } catch (e: any) {
      console.log("FAILED:", model, e.message);
    }
  }
}
run();
