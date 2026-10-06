import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  defineApprovalTask,
  createGithubWebhook,
  labelAdded,
  createLocalTransport,
  runQueueWorker,
  serveTriggers,
  createSqliteTaskQueue,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
  defineWorkflowJob,
} from "../../src/index.ts";
import type {
  QueueHandler,
  QueueJob,
  TaskQueue,
  WorkflowJson,
} from "../../src/index.ts";

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-workflow-job-"));
  const queue = await createSqliteTaskQueue(join(directory, "queue.sqlite"));
  const store = createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: join(directory, "storage"),
    }),
  });
  const workers: (() => Promise<void>)[] = [];
  t.after(async () => {
    for (const stop of workers) await stop();
    queue.close();
    await rm(directory, { recursive: true, force: true });
  });
  function startWorker(handlers: Record<string, QueueHandler>) {
    const stop = new AbortController();
    const running = runQueueWorker({
      queue,
      worker: "worker-1",
      handlers,
      signal: stop.signal,
      pollMs: 10,
    });
    workers.push(async () => {
      stop.abort();
      await running;
    });
  }
  return { queue, store, startWorker };
}

async function settle(queue: TaskQueue, id: string): Promise<QueueJob> {
  for (let attempt = 0; attempt < 500; attempt++) {
    const job = await queue.get(id);
    if (job && ["done", "failed"].includes(job.status)) return job;
    await delay(10);
  }
  throw new Error(`Job ${id} did not settle`);
}

test("webhook deliveries run a checkpointed workflow once per run", async (t) => {
  const { queue, store, startWorker } = await fixture(t);
  const performed: WorkflowJson[] = [];
  startWorker({
    fix: defineWorkflowJob({
      checkpoint: { store, version: "1" },
      workflow(input, context) {
        assert.equal(context.runId, "issue-42");
        return defineWorkflow("fix", [
          defineTask({
            key: "patch",
            perform: () => {
              performed.push(input);
              return { patched: true };
            },
          }),
        ]);
      },
    }),
  });
  const secret = "workflow-job-secret";
  const server = await serveTriggers({
    queue,
    routes: [
      {
        path: "/github",
        source: createGithubWebhook({ secret }),
        on(event) {
          const issue = labelAdded(event, "outpost:fix");
          if (!issue) return undefined;
          return {
            handler: "fix",
            runId: `issue-${issue.number}`,
            input: { repository: issue.repository, issue: issue.number },
          };
        },
      },
    ],
  });
  t.after(() => server.close());
  const body = JSON.stringify({
    action: "labeled",
    label: { name: "outpost:fix" },
    issue: { number: 42 },
    repository: { full_name: "acme/app" },
  });
  const deliver = (delivery: string) =>
    fetch(`${server.url}/github`, {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "x-github-event": "issues",
        "x-github-delivery": delivery,
        "x-hub-signature-256": `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`,
      },
    }).then((response) => response.json());
  assert.deepEqual(await deliver("d-1"), { job: "trigger:/github:d-1" });
  const first = await settle(queue, "trigger:/github:d-1");
  assert.equal(first.status, "done");
  assert.deepEqual(plain(first.result?.value), {
    runId: "issue-42",
    version: (first.result?.value as { version: string }).version,
    executionId: (first.result?.value as { executionId: string }).executionId,
    status: "done",
    tasks: [{ key: "patch", status: "done" }],
    pauses: [],
    inputRequests: [],
  });
  assert.deepEqual(plain(first.result?.usage), {
    input: 0,
    output: 0,
    cached: 0,
  });
  await deliver("d-2");
  const second = await settle(queue, "trigger:/github:d-2");
  assert.equal(second.status, "done");
  assert.deepEqual(
    plain(performed),
    [{ repository: "acme/app", issue: 42 }],
    "a second delivery for the same run restores the checkpoint",
  );
});

test("workflow jobs report pauses, failures and input conflicts", async (t) => {
  const { queue, store, startWorker } = await fixture(t);
  const review = () =>
    defineWorkflow("review", [
      defineApprovalTask({
        key: "approve",
        prompt: "Deploy?",
        actors: ["maintainer"],
      }),
    ]);
  startWorker({
    review: defineWorkflowJob({
      checkpoint: { store, version: "1" },
      workflow: review,
    }),
    broken: defineWorkflowJob({
      checkpoint: { store, version: "1" },
      start: { stopOnError: true },
      workflow: () =>
        defineWorkflow("broken", [
          defineTask({
            key: "explode",
            perform: () => {
              throw new Error("boom");
            },
          }),
        ]),
    }),
  });
  const publish = (id: string, handler: string, input: WorkflowJson) =>
    queue.enqueue({ id, handler, input });
  await publish("review-1", "review", { runId: "review", input: { pr: 1 } });
  const paused = await settle(queue, "review-1");
  assert.equal(paused.status, "done");
  const value = plain(paused.result?.value) as {
    status: string;
    version: string;
    executionId: string;
    pauses: {
      key: string;
      id: string;
      kind: string;
      prompt: string;
      actors: string[];
    }[];
  };
  assert.equal(value.status, "paused");
  assert.deepEqual(
    value.pauses.map(({ key, kind, prompt, actors }) => ({
      key,
      kind,
      prompt,
      actors,
    })),
    [
      {
        key: "approve",
        kind: "approval",
        prompt: "Deploy?",
        actors: ["maintainer"],
      },
    ],
  );
  assert.match(value.version, /^1#input:[0-9a-f]{32}$/);
  const approved = await review().start({
    checkpoint: { store, runId: "review", version: value.version },
    decisions: [
      {
        executionId: value.executionId,
        key: "approve",
        requestId: value.pauses[0]!.id,
        actor: "maintainer",
        reason: "Reviewed",
        action: "approve",
      },
    ],
  });
  assert.equal(approved.status, "done", "the reported version resumes the run");
  await publish("review-2", "review", { runId: "review", input: { pr: 2 } });
  const conflict = await settle(queue, "review-2");
  assert.equal(conflict.status, "failed");
  assert.match(conflict.result?.error ?? "", /checkpoint|identity/i);
  await publish("broken-1", "broken", { runId: "broken", input: null });
  const failed = await settle(queue, "broken-1");
  assert.equal(failed.status, "failed");
  assert.match(failed.result?.error ?? "", /^Workflow failed: .*boom/);
  assert.equal(
    (plain(failed.result?.value) as { status: string }).status,
    "failed",
  );
  await publish("malformed", "broken", { input: null });
  assert.match((await settle(queue, "malformed")).result?.error ?? "", /runId/);
});

test("defineWorkflowJob validates its options", () => {
  const store = createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: tmpdir() }),
  });
  assert.throws(
    () =>
      defineWorkflowJob({
        checkpoint: { store, version: "1" },
      } as unknown as Parameters<typeof defineWorkflowJob>[0]),
    /factory/,
  );
  assert.throws(
    () =>
      defineWorkflowJob({
        checkpoint: { store, version: "" },
        workflow: () => defineWorkflow("x", []),
      }),
    /version/,
  );
});

test("workflow jobs preserve a rejected checkpoint and report its termination code", async (t) => {
  const { queue, store, startWorker } = await fixture(t);
  const review = () =>
    defineWorkflow("review", [
      defineApprovalTask({
        key: "approve",
        prompt: "Deploy?",
        actors: ["maintainer"],
      }),
    ]);
  startWorker({
    review: defineWorkflowJob({
      checkpoint: { store, version: "1" },
      workflow: review,
    }),
  });
  const input = { runId: "rejected-review", input: null };
  await queue.enqueue({ id: "pause", handler: "review", input });
  const paused = await settle(queue, "pause");
  const value = plain(paused.result!.value) as {
    executionId: string;
    version: string;
    pauses: { id: string }[];
  };
  const rejected = await review().start({
    checkpoint: { store, runId: input.runId, version: value.version },
    decisions: [
      {
        executionId: value.executionId,
        key: "approve",
        requestId: value.pauses[0]!.id,
        actor: "maintainer",
        reason: "Needs revision",
        action: "reject",
      },
    ],
  });
  assert.equal(rejected.status, "rejected");
  await queue.enqueue({ id: "rejected", handler: "review", input });
  const job = await settle(queue, "rejected");
  assert.equal(job.status, "failed");
  assert.match(job.result!.error!, /^Workflow rejected:/);
  const summary = plain(job.result!.value) as {
    status: string;
    terminationCode: string;
  };
  assert.equal(summary.status, "rejected");
  assert.equal(summary.terminationCode, "rejected");
});
