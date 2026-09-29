// Verification loops — the agent codes, a real command checks, and a failure
// comes back to the agent as feedback, until the check accepts or rounds run out.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createSandbox,
  defineAgentTask,
  defineLoopTask,
  defineWorkflow,
  LoopTaskExhausted,
  type WorkflowEvent,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


// Shows each phase of each round.
const observe = (event: WorkflowEvent) => {
  if (event.type === "loop") console.log(`  ↻ ${event.key} · tour ${event.round} · ${event.phase}`);
};


// 1. The agent and its sandbox, kept for every round.
const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()],
  }),
});

await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  branch: { mode: "named", name: "demo/verification-loop" },
});


// 2. The loop: attempt = the agent fixes, check = `npm test` decides.
const fix = defineLoopTask({
  key: "fix",
  maxRounds: 4,
  timeoutMs: 300_000, // for one round: attempt + check

  async attempt(context, feedback) {
    // A defineAgentTask used as a helper: its usage, signal and observation follow the loop.
    const coding = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => ({
        agent: coder,
        brief: {
          file: join(import.meta.dirname, "fix.md"),
          values: { feedback: feedback ? `Les tests échouent encore :\n\n${feedback}` : "" },
        },
      }),
    });

    const result = await coding.perform(context);
    return { commits: result.commits.map((commit) => commit.subject) }; // JSON only, not the dispatch result
  },

  async check(context) {
    const tests = await sandbox.command({ executable: "npm", arguments: ["test"], signal: context.signal });
    if (tests.status === 0) return { done: true };

    const failures = tests.stdout.split("\n").filter((line) => /not ok|expected|actual/.test(line));
    console.log("  ✗", failures.filter((line) => line.includes("not ok")).join(" · "));
    return { done: false, feedback: failures.join("\n") };
  },
});


console.log("1. corriger jusqu'à ce que les tests passent");
const result = await defineWorkflow("verified-fix", [fix]).start({ observe, budget: { attempts: 6 } });
result.unwrap();

console.log("  commits :", result.value(fix).commits);
console.log("  tours :", result.tasks[0]?.rounds?.filter((round) => round.phase === "complete").length);
console.log("  usage :", result.usage.attempts, "tentatives,", result.usage.tokens.output, "jetons de sortie");


// 3. When no round passes, the task fails with LoopTaskExhausted and the last feedback.
console.log("\n2. une vérification qui n'accepte jamais");

const hopeless = defineLoopTask({
  key: "hopeless",
  maxRounds: 2,
  attempt: (context) => context.round,
  check: (context) => ({ done: false, feedback: `toujours pas bon au tour ${context.round}` }),
});

const exhausted = await defineWorkflow("hopeless", [hopeless]).start({ observe });
const [error] = exhausted.errors;

console.log("  statut :", exhausted.status);
if (error instanceof LoopTaskExhausted) console.log(`  ${error.message} — dernier retour : « ${error.feedback} »`);
