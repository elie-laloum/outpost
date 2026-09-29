// Model providers — talk to the model directly, with no agent or sandbox.
// A provider only carries requests: it never runs any tool.

import { model, modelProvider } from "../shared/model.ts";


// 1. A simple request: one prompt, one response.
const answer = await modelProvider.request({
  model: model.name,
  reasoning: model.reasoning,
  system: "Answer in one short sentence.",
  prompt: "What is the difference between a model and a harness?",
});

console.log(`[${answer.stopReason}]`, answer.text);
console.log("usage :", answer.usage);


// 2. The same thing, streamed: the text arrives chunk by chunk.
const stream = modelProvider.stream!({
  model: model.name,
  reasoning: model.reasoning,
  prompt: "Count from 1 to 10, separated by spaces.",
});

for await (const event of stream) {
  if (event.type === "text-delta") process.stdout.write(event.text);
  if (event.type === "result") console.log(`\n[${event.result.stopReason}]`);
}
