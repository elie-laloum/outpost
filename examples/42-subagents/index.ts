// Subagents — a coordinator delegates to specialized agents, exposed to it as tools.
// Children share the parent's sandbox but not its history; the parent's permissions
// still apply to them, and their tokens count toward the parent's budget.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  defineHarnessPermissions,
  defineHarnessSubagent,
  dispatch,
  OutpostError,
  type AgentEvent,
  type HarnessLimits,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);
const brief = (name: string) => ({ file: join(import.meta.dirname, name) });


// 1. Two children, each with its own tools and instructions.
const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "You inspect code and explain bugs. You never modify files.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 8 },
  }),
});

const implementer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "You make the smallest change that fixes the problem, then run the tests.",
    tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()],
    limits: { maxSteps: 15 }, // its own permissions allow everything
  }),
});


// 2. The coordinator: its only tools are the two children.
//    Its permissions also apply to every tool call of its children.
const permissions = defineHarnessPermissions({
  default: "allow",
  rules: [{ effect: "deny", tools: ["write_file", "edit_file"], paths: ["**/*.test.ts"], reason: "Les tests sont en lecture seule." }],
});

function coordinator(limits: HarnessLimits) {
  return createAgent({
    model,
    harness: createHarness({
      modelProvider,
      permissions,
      tools: [
        defineHarnessSubagent({ name: "review", description: "Find the cause of a bug, without modifying anything.", agent: reviewer }),
        defineHarnessSubagent({ name: "implement", description: "Change the code, run the tests and commit.", agent: implementer }),
      ],
      limits: { maxDelegationDepth: 1, ...limits }, // children cannot delegate in turn
    }),
  });
}


// Who is talking: child events carry the `subagentId` announced by the "subagent" event.
const names = new Map<string, string>();
const tokens = new Map<string, number>();

function observe(event: AgentEvent) {
  if (event.kind === "subagent") {
    names.set(event.id, event.name);
    console.log(`  ${event.status === "started" ? "→" : "←"} ${event.name} (${event.status})`);
  }

  const who = event.subagentId ? names.get(event.subagentId) ?? "?" : "coordinateur";
  if (event.kind === "tool" && event.subagentId) console.log(`    [${who}] ${event.name}`);
  if (event.kind === "tool-denied") console.log(`    [${who}] refusé : ${event.name} — ${event.reason}`);
  if (event.kind === "usage") tokens.set(who, (tokens.get(who) ?? 0) + event.tokens.output);
}


// 3. Delegation: review explains, implement fixes and commits, in the same sandbox.
console.log("1. corriger en déléguant");
const fixed = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator({ maxSteps: 10 }),
  branch: { mode: "named", name: "demo/subagents" },
  brief: brief("fix.md"),
  observe,
});

console.log("  ", fixed.text);
console.log("  commits :", fixed.commits.map((commit) => commit.subject));

// Each child's tokens are counted once in the dispatch total.
for (const [who, output] of tokens) console.log(`  ${who} : ${output} jetons de sortie`);
console.log(`  total : ${fixed.usage.output} jetons de sortie`);


// 4. The parent's permissions win: the child may edit files, but not the tests.
console.log("\n2. un enfant bloqué par les permissions du parent");
const denied = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator({ maxSteps: 6 }),
  brief: brief("extend.md"),
  observe,
});

console.log("  ", denied.text);


// 5. A tight output budget on the coordinator: its children's tokens use it up too.
console.log("\n3. un budget du parent épuisé par un enfant");
try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coordinator({ maxSteps: 10, usage: { output: 300 } }),
    brief: brief("fix.md"),
    observe,
  });
  console.log("  terminé sous le budget ?!");
} catch (error) {
  if (!(error instanceof OutpostError)) throw error;
  console.log(`  code ${error.code} : ${error.message}`);
}
