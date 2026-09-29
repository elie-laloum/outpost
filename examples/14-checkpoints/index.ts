// Checkpoints — a workflow's results survive interruptions.
// Four steps that call the model, then several launches of the same run,
// cut off at different steps: each resume starts from the last successful step.

import { rm } from "node:fs/promises";
import { join } from "node:path";
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  type Task,
  type WorkflowCheckpointOptions,
} from "@elie-laloum/outpost";
import { model, modelProvider } from "../shared/model.ts";


// The simulated crash: the step named here fails before calling the model.
let cutAt: string | undefined;
let modelCalls: string[] = [];

function step(key: string, after: Task<string>[], prompt: (previous: string[]) => string) {
  return defineTask({
    key,
    after,
    perform: async (context) => {
      // Same key for every attempt and resume of this step in this run: use it to deduplicate effects.
      console.log(`  ${key} · clé d'effet …${context.idempotencyKey.slice(-8)}`);
      if (cutAt === key) throw new Error(`coupure simulée pendant « ${key} »`);

      modelCalls.push(key);
      const answer = await modelProvider.request({
        model: model.name,
        reasoning: model.reasoning,
        prompt: prompt(after.map((dependency) => context.value(dependency))),
      });

      if (answer.usage) context.reportUsage(answer.usage); // usage is accumulated in the checkpoint
      return answer.text.trim();
    },
  });
}


// 1. a name → 2. a slogan → 3. a menu → 4. a poster
const naming = step("naming", [], () =>
  "Invent a name for a small coffee shop. Reply with the name only.");

const slogan = step("slogan", [naming], ([name]) =>
  `Write a one-line slogan for the coffee shop "${name}". Reply with the slogan only.`);

const menu = step("menu", [naming], ([name]) =>
  `List three signature drinks for "${name}", comma-separated, nothing else.`);

const poster = step("poster", [slogan, menu], ([line, drinks]) =>
  `Write a three-line opening poster using this slogan: "${line}" and these drinks: ${drinks}.`);

const plan = defineWorkflow("coffee-shop", [naming, slogan, menu, poster]);


const directory = join(import.meta.dirname, "state");
await rm(directory, { recursive: true, force: true }); // each demo launch starts from scratch

const checkpoint: WorkflowCheckpointOptions = {
  store: createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory }) }),
  runId: "coffee-shop-1", // same id = same run, reopened
  version: "1",           // change this if the graph or prompts change
};


// One launch = what a new process would do after a crash.
async function run(title: string, options: { cut?: string; checkpoint?: WorkflowCheckpointOptions } = {}) {
  console.log(`\n── ${title}`);
  cutAt = options.cut;
  modelCalls = [];

  try {
    const result = await plan.start({ checkpoint: options.checkpoint ?? checkpoint });

    console.log("statut :", result.status);
    console.log("étapes :", result.tasks.map((record) => `${record.key}=${record.status}`).join("  "));
    console.log("appels au modèle :", modelCalls.length ? modelCalls.join(", ") : "aucun");
    console.log("usage cumulé :", result.usage.attempts, "tentatives,", result.usage.tokens.output, "jetons de sortie");
    return result;
  } catch (error) {
    console.log("refusé :", (error as Error).message);
  }
}


// Run 1 — cut off at step 2: only the name is secured.
await run("run 1 : coupure au slogan", { cut: "slogan" });

// Run 2 — relaunching as is gets refused: replaying an interrupted step must be explicit.
await run("run 2 : relance sans autorisation");

// Run 3 — resume allowed, cut off at step 4: the name comes from the checkpoint, slogan and menu get done.
await run("run 3 : reprise, coupure à l'affiche", {
  cut: "poster",
  checkpoint: { ...checkpoint, resume: "retry-incomplete" },
});

// Run 4 — resume without a cut: only the poster is left to produce.
await run("run 4 : reprise jusqu'au bout", {
  checkpoint: { ...checkpoint, resume: "retry-incomplete" },
});

// Run 5 — the run is finished: everything is read back from disk, the model is no longer called.
const final = await run("run 5 : relance d'un run terminé");

// Run 6 — a different graph version cannot reopen this checkpoint.
await run("run 6 : version 2", { checkpoint: { ...checkpoint, version: "2" } });


console.log("\n── résultat");
console.log("nom    :", final?.value(naming));
console.log("slogan :", final?.value(slogan));
console.log("menu   :", final?.value(menu));
console.log(final?.value(poster));
