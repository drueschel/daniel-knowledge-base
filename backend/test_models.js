const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const models = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-20240620",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-2.1",
  "claude-sonnet-5-5",
  "claude-sonnet-3.5"
];

async function main() {
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const msg = await anthropic.messages.create({
        model: model,
        max_tokens: 10,
        messages: [{ role: "user", content: "Hello" }],
      });
      console.log(`SUCCESS: ${model}`);
      return; // Exit on first success
    } catch (e) {
      console.log(`FAILED: ${model} - ${e.message}`);
    }
  }
}

main();
