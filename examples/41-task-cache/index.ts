// Task result cache — the same review, on the same code, with the same brief and model,
// is not paid for twice: the JSON result is stored in a Transport under a fingerprint
// of the inputs, and restored instead of calling the agent again.

import { execFileSync } from "node:child_process";
import { appendFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  createTaskCacheStore,
  defineTask,
  defineWorkflow,
  dispatch,
  planRecoveryRetention,
  pruneRecoveryRetention,
  repositoryFingerprint,
  type TaskCacheMode,
  type WorkflowEvent,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });

const transporter = createLocalTransport({ directory: state });
const store = createTaskCacheStore({ transporter });

const brief = await readFile(join(import.meta.dirname, "review.md"), "utf8");
const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

// 1. A cached review. The key lists everything that can change the answer:
//    the working tree (uncommitted edits included), the brief and the model.
//    defineLoopTask accepts the same `cache` option; gates, interactive tasks, defineAgentTask and defineIsolatedTask refuse it.
function review(mode: TaskCacheMode = "reuse") {
  return defineTask({
    key: "review",
    cache: {
      store,
      version: "review-v1", // change it when the task, the agent or the output contract change
      mode,
      key: async () => [
        await repositoryFingerprint(repository),
        brief,
        model.name,
      ],
    },
    perform: async (context) => {
      const result = await dispatch({
        repository,
        sandboxProvider,
        agent: reader,
        brief: { text: brief },
        includeUncommitted: true,
        signal: context.signal,
      });

      context.reportUsage(result.usage);
      return { text: result.text }; // a cached value must be JSON
    },
  });
}

const observe = (event: WorkflowEvent) => {
  if (event.type === "cache")
    console.log(
      `  cache : ${event.cache}${event.error ? ` (${event.error})` : ""}`,
    );
};

async function run(title: string, mode?: TaskCacheMode) {
  console.log(`\n${title}`);
  const summary = review(mode);
  const result = await defineWorkflow("docs-review", [summary]).start({
    observe,
  });
  result.unwrap();

  const hit = result.tasks[0]?.cacheHit ?? false;
  console.log(
    `  ${hit ? "restauré" : "exécuté"} · ${result.usage.attempts} tentative(s) · ${result.usage.tokens.input} jetons en entrée`,
  );
}

// 2. First run: nothing stored yet.
await run("1. premier passage");

// 3. Same inputs: restored, no agent, no tokens, no attempt consumed.
await run("2. mêmes entrées");

// 4. An uncommitted edit changes the fingerprint: the review runs again.
await appendFile(
  join(repository, "todo.ts"),
  "\nexport const count = () => todos.length;\n",
);
await run("3. après une modification non commitée");

// 5. Back to the original tree: the first entry matches again.
execFileSync("git", ["checkout", "--", "todo.ts"], { cwd: repository });
await run("4. retour à l'état initial");

// 6. "refresh" ignores the entry, runs and replaces it (after a model update, say).
await run("5. rafraîchissement forcé", "refresh");

// 7. Entries stay until you remove them: the retention policy can prune them.
console.log("\n6. rétention");
const plan = await planRecoveryRetention({
  transporter,
  policy: { version: 1, scopes: ["task-cache"], minAgeMs: 0 }, // in practice: days, not zero
});
for (const entry of plan.entries)
  console.log(
    `  ${entry.eligible ? "supprimable" : "conservée  "} ${entry.path}`,
  );

const pruned = await pruneRecoveryRetention(plan, { transporter });
console.log(`  ${pruned.removed.length} entrée(s) supprimée(s)`);
