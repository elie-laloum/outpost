// Quota pauses — when a subscription or API limit is reached, the task pauses
// instead of failing, then resumes after the reset: in the same process when the wait
// is short, or in a later start() with the same checkpoint when it is long.

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  createOpenAIModelProvider,
  createSandbox,
  createWorkflowCheckpointStore,
  defineAgentTask,
  defineTask,
  defineWorkflow,
  type WorkflowEvent,
  type WorkflowResult,
} from "@elie-laloum/outpost";
import { model, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";
import { quotaProxy } from "./quota-proxy.ts";


const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });

// The model goes through a proxy that will play the provider hitting its limit.
const proxy = await quotaProxy(process.env.OPENAPI_URL!);
const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider: createOpenAIModelProvider({ baseUrl: proxy.url, apiKey: process.env.OPENAPI_KEY! }),
    tools: [createHarnessFileTools()],
  }),
});

await using sandbox = await createSandbox({ repository: demoRepository(import.meta.dirname), sandboxProvider });


// 1. Three tasks: an agent review, an independent task, and one that depends on the review.
function tasks() {
  const review = defineTask({
    key: "review",
    perform: async (context) => {
      if (context.quota) console.log(`  ↪ reprise après le quota — conversation : ${context.quota.conversation ?? "aucune, la tâche repart du brief"}`);

      // Called as a helper, defineAgentTask continues the interrupted conversation by itself when
      // the agent captured one (Claude, Codex, Copilot, Kimi); the built-in harness starts over.
      // quotaResume: "restart" always resends the original brief, whatever the agent.
      const coding = defineAgentTask({
        key: "reviewer",
        sandbox,
        request: () => ({ agent: reviewer, brief: { file: join(import.meta.dirname, "review.md") } }),
        quotaResume: "restart",
      });
      const result = await coding.perform(context);
      return result.text; // JSON only: the checkpoint must be able to store it
    },
  });

  const changelog = defineTask({ key: "changelog", perform: () => "- fix VAT computation" });
  const publish = defineTask({ key: "publish", after: [review], perform: (context) => `publié : ${context.value(review).length} caractères` });

  return defineWorkflow("nightly", [review, changelog, publish]);
}

const observe = (event: WorkflowEvent) => {
  if (event.type !== "quota") return;
  const wait = event.delayMs === undefined ? "" : `, attente de ${Math.round(event.delayMs / 1000)} s`;
  console.log(`  ⏸ quota sur ${event.key} : ${event.status}${wait}`);
};

const show = (result: WorkflowResult) =>
  console.log(`  → ${result.status} (${result.tasks.map((record) => `${record.key}=${record.status}`).join(", ")}) · ${proxy.requests()} requêtes au modèle`);

const checkpoint = (runId: string) => ({
  store: createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory: state }) }),
  runId,
  version: "1",
});


try {
  // 2. Short limit (3 s): within maxWaitMs, the task waits in the process and resumes.
  console.log("1. limite courte : attente dans le processus");
  proxy.limitAfter(1, 3); // the 2nd model request of the review hits the limit

  show(await tasks().start({ observe, checkpoint: checkpoint("short"), onQuota: { action: "pause", maxWaitMs: 10_000 } }));


  // 3. Long limit (20 s): beyond maxWaitMs, the pause is durable and the process is free.
  console.log("\n2. limite longue : pause durable");
  proxy.limitAfter(1, 20);

  const options = { observe, checkpoint: checkpoint("long"), onQuota: { action: "pause" as const, maxWaitMs: 5_000 } };
  const paused = await tasks().start(options);
  show(paused);

  const pause = paused.tasks.find((record) => record.key === "review")?.quota;
  console.log(`  quota : « ${pause?.message} », levée à ${pause?.resetAt}`);


  // 4. Starting again before the reset changes nothing and calls no model.
  console.log("\n3. relance avant la levée");
  show(await tasks().start(options));


  // 5. After the reset, a new start() — here after a pause, in real life a later job.
  const waitMs = Date.parse(pause!.resetAt!) - Date.now();
  console.log(`\n4. relance après la levée (dans ${Math.ceil(waitMs / 1000)} s)`);
  await sleep(Math.max(0, waitMs));

  const resumed = await tasks().start(options);
  show(resumed);
  resumed.unwrap();
} finally {
  await proxy.close();
}
