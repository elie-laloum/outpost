// Diagnostics — check that the environment can do what you're about to ask of it,
// before blaming the agent or the code.

import { createSandbox, diagnoseSandbox } from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
});


// 1. Probe the sandbox: commands, file transfers, terminal…
const report = await diagnoseSandbox(sandbox, { transfers: true });

for (const check of report.checks) console.log(`[${check.status}] ${check.id} — ${check.message}`);

for (const capability of report.capabilities) console.log(`  ${capability.id} : ${capability.observed}`);

console.log("échecs :", report.hasFailures);


// 2. Diagnostics don't prove model access ("unverified"): test it separately.
console.log("modèle :", report.modelCompatibility);

const ping = await modelProvider.request({ model: model.name, prompt: "Reply with the single word: pong" });

console.log(`${model.name} répond :`, ping.text.trim());
