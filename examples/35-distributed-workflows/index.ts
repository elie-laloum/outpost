// Workflows across several workers — what it takes to trust a queue shared by many processes:
//   · HTTP credentials that rotate without stopping anybody;
//   · a stable idempotency key, so a job replayed after a crash has no duplicate effect;
//   · approvals signed with Ed25519 keys, verified before the workflow moves on.
// Everything runs in one process here; each part could live on its own machine.

import { generateKeyPairSync, randomBytes } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  createEd25519DecisionVerifier,
  createHttpTaskQueue,
  createLocalTransport,
  createSqliteTaskQueue,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineQueuedTask,
  defineWorkflow,
  runQueueWorker,
  serveTaskQueue,
  signWorkflowDecision,
  type QueueHandler,
} from "@elie-laloum/outpost";
import { model, modelProvider } from "../shared/model.ts";
import { releaseChannel } from "./release-channel.ts";

const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });

// 1. The queue, served over HTTP. The server accepts a *list* of tokens,
//    each client sends its *current* one: both are read again on every request.
const tokens = {
  old: randomBytes(32).toString("hex"),
  new: randomBytes(32).toString("hex"),
};
let accepted = [tokens.old];
let current = tokens.old;

const storage = await createSqliteTaskQueue(join(state, "jobs.sqlite"));
const server = await serveTaskQueue({ queue: storage, token: () => accepted });
const client = () =>
  createHttpTaskQueue({ url: server.url, token: () => current });

// 2. The handlers. `publish` has an external effect: it goes through the key.
const channel = releaseChannel(join(state, "channel.sqlite"));
let crashes = 1; // the first worker to publish will "crash" right after the effect

function handlers(
  worker: string,
  crash: AbortController,
): Record<string, QueueHandler> {
  return {
    async draft(changes, { signal }) {
      const answer = await modelProvider.request({
        model: model.name,
        reasoning: model.reasoning,
        prompt: `Write release notes in three short bullet points for these changes:\n${changes}`,
        signal,
      });
      console.log(`  ${worker} a rédigé les notes`);
      return { value: answer.text.trim() };
    },

    async publish(notes, { idempotencyKey, signal }) {
      const receipt = channel.publishOnce(idempotencyKey, String(notes));
      console.log(
        `  ${worker} publie → n°${receipt.id}${receipt.replayed ? " (reçu retrouvé, rien republié)" : ""}`,
      );

      if (crashes-- > 0) {
        console.log(`  💥 ${worker} tombe avant d'avoir rendu son résultat`);
        crash.abort();
        signal.throwIfAborted();
      }
      return { value: receipt.id };
    },
  };
}

// Two workers on the same queue, each with its own name, lease and client.
const workers = ["worker-a", "worker-b"].map((name) => {
  const stop = new AbortController();
  const done = runQueueWorker({
    queue: client(),
    worker: name,
    handlers: handlers(name, stop),
    signal: stop.signal,
    leaseMs: 2_000, // a crashed worker's job is reclaimable after its lease expires
    pollMs: 200,
  }).catch(() => {});

  return { stop, done };
});

// 3. The workflow: draft on a worker → signed approval → publish on a worker.
const changes =
  "- faster startup\n- fix crash on empty config\n- new --json flag";

const draft = defineQueuedTask({
  key: "draft",
  queue: client(),
  handler: "draft",
  input: () => changes,
  decode: String,
  pollMs: 200,
});

const approve = defineApprovalTask({
  key: "approve",
  after: [draft],
  prompt: "Publish these release notes?",
  actors: ["release-manager"],
  authentication: "signed", // an unsigned decision will be refused
});

const publish = defineQueuedTask({
  key: "publish",
  after: [draft, approve],
  queue: client(),
  handler: "publish",
  input: (context) => context.value(draft),
  decode: Number,
  pollMs: 200,
});

const plan = defineWorkflow("release", [draft, approve, publish]);

const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: join(state, "checkpoints"),
    }),
  }),
  runId: "release-7.0.0",
  version: "1",
};

// 4. The approver's keys. Only the public key is known to the workflow side;
//    the list is read again on each check, so a key can be added or revoked live.
const approver = generateKeyPairSync("ed25519");
const decisionVerifier = createEd25519DecisionVerifier({
  keys: () => [
    {
      keyId: "release-manager-2026",
      actor: "release-manager",
      publicKey: approver.publicKey,
    },
  ],
});

try {
  console.log("1. rédaction, puis pause en attente d'approbation");
  const paused = await plan.start({ checkpoint, decisionVerifier });
  const request = paused.tasks.find(
    (record) => record.key === "approve",
  )!.pause!;

  console.log("  statut :", paused.status);
  console.log(paused.value(draft).replace(/^/gm, "  │ "));

  console.log("\n2. rotation des jetons pendant la pause");
  accepted = [tokens.old, tokens.new]; // publish both
  current = tokens.new; // move every client to the new one
  accepted = [tokens.new]; // then revoke the old one

  const stale = createHttpTaskQueue({ url: server.url, token: tokens.old });
  await stale.get("draft").then(
    () => console.log("  ancien jeton → accepté ?!"),
    (error) =>
      console.log("  ancien jeton → refusé :", (error as Error).message),
  );

  console.log("\n3. une décision non signée est refusée");
  const decision = {
    executionId: paused.executionId,
    key: "approve",
    requestId: request.id,
    action: "approve" as const,
    actor: "release-manager",
    reason: "Notes relues",
  };

  const forged = await plan
    .start({ checkpoint, decisionVerifier, decisions: [decision] })
    .catch((error) => error);
  console.log("  →", forged instanceof Error ? forged.message : forged.status);

  console.log("\n4. décision signée : reprise et publication");
  const signed = signWorkflowDecision({
    decision,
    keyId: "release-manager-2026",
    privateKey: approver.privateKey,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  });

  const finished = await plan.start({
    checkpoint,
    decisionVerifier,
    decisions: [signed],
  });
  finished.unwrap();

  console.log(
    "  statut :",
    finished.status,
    "— publication n°",
    finished.value(publish),
  );
  console.log("  publications réellement faites :", channel.count());
} finally {
  for (const worker of workers) worker.stop.abort();
  await Promise.all(workers.map((worker) => worker.done));
  await server.close();
  storage.close();
  channel.close();
}
