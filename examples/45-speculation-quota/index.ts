// Quota in a speculation — a candidate stopped by a limit settles with status "quota".
// With no winner, the race ends with status "quota" and the earliest reset; thrown from a
// workflow task, it pauses the workflow. The durable race then reruns only that candidate.

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createLocalTransport,
  createOpenAIModelProvider,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  OutpostError,
  speculate,
  type ModelProvider,
  type WorkflowEvent,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";
import { quotaProxy } from "../39-quota-pauses/quota-proxy.ts";


const repository = demoRepository(import.meta.dirname);
const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
const transporter = createLocalTransport({ directory: state });

// Same coder, two model connections: direct, or through the proxy from demo 39.
const proxy = await quotaProxy(process.env.OPENAPI_URL!);

const coder = (provider: ModelProvider) =>
  createAgent({
    model,
    harness: createHarness({ modelProvider: provider, tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()] }),
  });

const direct = coder(modelProvider);
const limited = coder(createOpenAIModelProvider({ baseUrl: proxy.url, apiKey: process.env.OPENAPI_KEY! }));


// 1. The race: "lowercase" fixes too little and will be rejected; "complete" will hit the limit.
//    Durable, so that a race finished on "quota" can be taken up again.
const race = defineTask({
  key: "race",
  async perform(context) {
    const result = await speculate({
      repository,
      sandboxProvider,
      concurrency: 2,
      budget: { attempts: 3 }, // cumulative across reruns
      durability: { transporter, runId: "slug-race", version: "1" },
      signal: context.signal,

      candidates: [
        { key: "lowercase", agent: direct, request: { brief: { file: join(import.meta.dirname, "lowercase.md") } } },
        { key: "complete", agent: limited, request: { brief: { file: join(import.meta.dirname, "complete.md") } } },
      ],

      async validate({ sandbox, signal }) {
        const tests = await sandbox.command({ executable: "npm", arguments: ["test"], signal });
        return tests.status === 0;
      },
    });

    for (const candidate of result.candidates) console.log(`  ${candidate.key} → ${candidate.status}${candidate.quota ? ` (« ${candidate.quota.message} »)` : ""}`);
    for (const attempt of result.previousAttempts ?? []) console.log(`  tentative précédente : ${attempt.key} (${attempt.status})`);
    console.log(`  course : ${result.status}`);

    // 2. No winner because of a limit: hand it to the workflow as a quota error.
    if (result.status === "quota" && result.quota) {
      throw new OutpostError("quota", result.quota.message, result.quota.resetAt ? { resetAt: result.quota.resetAt } : {});
    }
    return result.winner?.branch ?? null;
  },
});


// 3. The workflow pauses on the quota. Here the reset is already past when the race ends:
//    the pause is durable, and a later start() with the same checkpoint runs the task again.
const observe = (event: WorkflowEvent) => {
  if (event.type === "quota") console.log(`  ⏸ quota : ${event.status}${event.delayMs ? `, attente de ${Math.round(event.delayMs / 1000)} s` : ""}`);
};

const slug = defineWorkflow("slug", [race]);
const options = {
  observe,
  checkpoint: { store: createWorkflowCheckpointStore({ transporter }), runId: "slug-workflow", version: "1" },
  onQuota: { action: "pause" as const, maxWaitMs: 30_000 }, // a reset still ahead is awaited in the process
};

try {
  console.log("1. première course, le proxy refuse tout pendant 10 s");
  proxy.limitFor(10);

  const paused = await slug.start(options);
  const pause = paused.tasks[0]?.quota;
  console.log(`  → workflow ${paused.status}, levée à ${pause?.resetAt}`);


  // 4. After the reset: only "complete" runs again, as a new attempt from the baseline.
  await sleep(Math.max(0, Date.parse(pause!.resetAt!) - Date.now()));
  console.log("\n2. relance après la levée");

  const resumed = await slug.start(options);
  resumed.unwrap();
  console.log(`  → gagnant sur ${resumed.value(race)}`);
} finally {
  await proxy.close();
}
