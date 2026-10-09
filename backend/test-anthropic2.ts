import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
async function run() {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: "Write a 50 word story about a cat." }]
  });
  console.log(JSON.stringify(msg, null, 2));
}
run();
