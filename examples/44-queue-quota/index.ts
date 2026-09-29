// Quota in a queue — the worker's handler hits a limit (HTTP 429): the job fails with a
// quota record, and the coordinator's defineQueuedTask rejects with code "quota".
// With onQuota, the workflow waits for the reset and publishes a new job,
// while the handler keeps the same idempotency key for its effects.

import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  createLocalTransport,
  createOpenAIModelProvider,
  createSqliteTaskQueue,
  createWorkflowCheckpointStore,
  defineQueuedTask,
  defineWorkflow,
  quotaFault,
  runQueueWorker,
  type QueueHandlerContext,
  type WorkflowEvent,
  type WorkflowJson,
} from "@elie-laloum/outpost";
import { model } from "../shared/model.ts";
import { quotaProxy } from "../39-quota-pauses/quota-proxy.ts";


const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });

// The model goes through the proxy from demo 39, which can play a limited provider.
const proxy = await quotaProxy(process.env.OPENAPI_URL!);
const modelProvider = createOpenAIModelProvider({ baseUrl: proxy.url, apiKey: process.env.OPENAPI_KEY! });

const queue = await createSqliteTaskQueue(join(state, "jobs.sqlite"));


// 1. The worker. Its handler lets the quota error through: the worker records it in the job.
const jobs: string[] = [];

async function summarize(input: WorkflowJson, { job, idempotencyKey, signal }: QueueHandlerContext) {
  jobs.push(job.id);
  console.log(`  worker : job …${job.id.slice(-12)} · clé d'effet …${idempotencyKey.slice(-12)}`);

  const answer = await modelProvider.request({
    model: model.name,
    reasoning: model.reasoning,
    prompt: `Summarize in one sentence:\n\n${input}`,
    signal,
  });
  return { value: answer.text.trim() };
}

const stop = new AbortController();
const worker = runQueueWorker({ queue, worker: "summarizer", handlers: { summarize }, signal: stop.signal, pollMs: 200 });


// 2. The coordinator: one task that goes through the queue.
const text = "Outpost runs coding agents in sandboxes, on a branch, and returns their commits.";

function plan(name: string) {
  const summary = defineQueuedTask({ key: "summary", queue, handler: "summarize", input: () => text, decode: String, pollMs: 200 });
  return { summary, flow: defineWorkflow(name, [summary]) };
}

const observe = (event: WorkflowEvent) => {
  if (event.type === "quota") console.log(`  ⏸ quota : ${event.status}${event.delayMs ? `, attente de ${Math.round(event.delayMs / 1000)} s` : ""}`);
};


try {
  // 3. Without onQuota: the limit is an ordinary failure, with code "quota" and the reset.
  console.log("1. sans onQuota");
  proxy.limitAfter(0, 3);

  const failed = await plan("no-policy").flow.start({ observe });
  const fault = quotaFault(failed.errors[0]);

  console.log(`  → ${failed.status} · « ${fault?.message} » · levée à ${fault?.resetAt}`);
  const job = await queue.get(jobs.at(-1)!);
  console.log(`  job : ${job?.status}, quota enregistré :`, job?.result?.quota);


  // 4. With onQuota (it needs a checkpoint): the workflow waits for the reset, then publishes
  //    a new job, "<key>:quota:<attempt>", because a failed job never runs again.
  console.log("\n2. avec onQuota");
  jobs.length = 0;
  proxy.limitAfter(0, 3);

  const checkpoint = {
    store: createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory: join(state, "checkpoints") }) }),
    runId: "summary-1",
    version: "1",
  };

  const { summary, flow } = plan("paused");
  const result = await flow.start({ observe, checkpoint, onQuota: { action: "pause", maxWaitMs: 10_000 } });
  result.unwrap();

  console.log("  →", result.value(summary));
  console.log(`  ${jobs.length} jobs, même clé d'effet ; requêtes au modèle : ${proxy.requests()}`);
} finally {
  stop.abort();
  await worker;
  queue.close();
  await proxy.close();
}
