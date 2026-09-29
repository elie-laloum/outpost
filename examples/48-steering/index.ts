// Steering — send an instruction to an agent that is already working, without cancelling it.
// The built-in harness adds it before its next model request; the agent reads it as a user message.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createSteering,
  defineHarnessSubagent,
  dispatch,
  OutpostError,
  type AgentEvent,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);
const brief = (name: string) => ({ file: join(import.meta.dirname, name) });

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

const printSteer = (event: AgentEvent) => {
  if (event.kind === "steer") console.log(`  ✉ consigne reçue (${event.mode}) : ${event.text}`);
};


// 1. After the agent's first tool call, a new constraint arrives.
console.log("1. consigne pendant le travail");
const steering = createSteering();
let sent = false;

const named = await dispatch({
  repository,
  sandboxProvider,
  agent: reader,
  brief: brief("name.md"),
  steering,
  observe(event) {
    printSteer(event);
    if (event.kind !== "tool" || sent) return;
    sent = true;
    console.log("  outil :", event.name, "→ on envoie une consigne");
    void steering.send("Le café est à Lyon : le nom doit y faire référence.").then(({ mode }) => console.log(`  livrée : ${mode}`));
  },
});

console.log("  réponse :", named.text.trim());


// 2. A coordinator delegates to a subagent: the instruction targets that run by its id.
console.log("\n2. consigne adressée à un sous-agent");
const coordinator = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [defineHarnessSubagent({ name: "inspect", description: "Read files and report their content.", agent: reader })],
  }),
});

const menu = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator,
  brief: brief("review.md"),
  steering, // a controller serves one dispatch at a time, and can be reused for the next one
  observe(event) {
    printSteer(event);
    if (event.kind !== "subagent" || event.status !== "started") return;
    console.log(`  → sous-agent ${event.name} (${event.id})`);
    void steering.send("Ne rapporte que les boissons chaudes.", { subagent: event.id });
  },
});

console.log("  carte :\n" + menu.text.trim().replace(/^/gm, "    "));


// 3. Once closed, the controller refuses every instruction, with code "steering".
console.log("\n3. contrôleur fermé");
steering.close();

try {
  await steering.send("Trop tard.");
} catch (error) {
  if (!(error instanceof OutpostError)) throw error;
  console.log(`  code : ${error.code} · ${error.message}`);
}
