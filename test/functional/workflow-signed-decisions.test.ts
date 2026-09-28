import assert from "node:assert/strict";
import { test } from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  approvalTask,
  workflow,
  task,
  workflowCheckpointStore,
  localTransport,
  signWorkflowDecision,
  ed25519DecisionVerifier,
} from "../../src/index.ts";
import type { WorkflowApproverKey, WorkflowDecision } from "../../src/index.ts";

const oldKey = generateKeyPairSync("ed25519");
const newKey = generateKeyPairSync("ed25519");
const future = () => new Date(Date.now() + 60_000).toISOString();

test("signed gates verify identities atomically, rotate keys, preserve audit and reject policy downgrade", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-signed-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: workflowCheckpointStore({
      transporter: localTransport({ directory }),
    }),
    runId: "signed",
    version: "1",
  };
  const gate = approvalTask({
    key: "review",
    prompt: "Ship?",
    actors: ["maintainer"],
    authentication: "signed",
  });
  let calls = 0;
  const child = task({ key: "ship", after: [gate], perform: () => ++calls });
  const graph = workflow("signed", [gate, child]);
  const paused = await graph.start({ checkpoint });
  const decision: WorkflowDecision = {
    executionId: paused.executionId,
    key: gate.key,
    requestId: paused.tasks[0]!.pause!.id,
    actor: "maintainer",
    reason: "Reviewed",
    action: "approve",
  };
  const signed = signWorkflowDecision({
    decision,
    privateKey: oldKey.privateKey,
    keyId: "old",
    expiresAt: future(),
  });
  let keys: readonly WorkflowApproverKey[] = [
    { keyId: "old", actor: "maintainer", publicKey: oldKey.publicKey },
  ];
  const decisionVerifier = ed25519DecisionVerifier({ keys: async () => keys });
  await assert.rejects(
    graph.start({ checkpoint, decisions: [decision], decisionVerifier }),
    /Signed/,
  );
  await assert.rejects(
    graph.start({ checkpoint, decisions: [signed] }),
    /Signed/,
  );
  for (const modified of [
    { ...signed, reason: "Unreviewed" },
    { ...signed, action: "reject" as const },
    { ...signed, actor: "intruder" },
    { ...signed, requestId: "different" },
    { ...signed, executionId: "different" },
    {
      ...signed,
      proof: { ...signed.proof!, expiresAt: "2000-01-01T00:00:00Z" },
    },
    { ...signed, proof: { ...signed.proof!, signature: "invalid" } },
  ]) {
    await assert.rejects(
      graph.start({ checkpoint, decisions: [modified], decisionVerifier }),
    );
    assert.equal((await graph.start({ checkpoint })).status, "paused");
    assert.equal(calls, 0);
  }
  keys = [{ keyId: "old", actor: "intruder", publicKey: oldKey.publicKey }];
  await assert.rejects(
    graph.start({ checkpoint, decisions: [signed], decisionVerifier }),
    /approver/,
  );
  keys = [{ keyId: "new", actor: "maintainer", publicKey: newKey.publicKey }];
  await assert.rejects(
    graph.start({ checkpoint, decisions: [signed], decisionVerifier }),
    /revoked/,
  );
  const rotated = signWorkflowDecision({
    decision,
    privateKey: newKey.privateKey,
    keyId: "new",
    expiresAt: future(),
  });
  const accepted = await graph.start({
    checkpoint,
    decisions: [rotated],
    decisionVerifier,
  });
  accepted.unwrap();
  assert.equal(calls, 1);
  assert.equal(accepted.value(gate).verification?.keyId, "new");
  assert.equal("proof" in accepted.value(gate), false);
  keys = [];
  const restored = await graph.start({ checkpoint });
  restored.unwrap();
  assert.deepEqual(restored.value(gate), accepted.value(gate));
  assert.equal(calls, 1);
  await assert.rejects(
    graph.start({ checkpoint, decisions: [rotated], decisionVerifier }),
    /unauthorized/,
  );
  const downgraded = approvalTask({
    key: "review",
    prompt: "Ship?",
    actors: ["maintainer"],
  });
  await assert.rejects(
    workflow("signed", [
      downgraded,
      task({ key: "ship", after: [downgraded], perform: () => 0 }),
    ]).start({ checkpoint }),
    /incompatible/,
  );
});

test("decision verifier rejects expired proofs, duplicate IDs and non-Ed25519 keys", async (t) => {
  const decision: WorkflowDecision = {
    executionId: "run",
    key: "review",
    requestId: "request",
    actor: "maintainer",
    reason: "Reviewed",
    action: "approve",
  };
  const expiresAt = new Date(Date.now() + 1000).toISOString();
  const signed = signWorkflowDecision({
    decision,
    privateKey: oldKey.privateKey,
    keyId: "old",
    expiresAt,
  });
  const key = {
    keyId: "old",
    actor: "maintainer",
    publicKey: oldKey.publicKey,
  };
  await assert.rejects(
    async () => ed25519DecisionVerifier({ keys: () => [key, key] })(signed),
    /approver/,
  );
  await assert.rejects(
    async () =>
      ed25519DecisionVerifier({
        keys: () => [{ ...key, publicKey: newKey.publicKey }],
      })(signed),
    /signature/,
  );
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse(expiresAt) });
  await assert.rejects(
    async () => ed25519DecisionVerifier({ keys: () => [key] })(signed),
    /expired/,
  );
  assert.throws(
    () =>
      signWorkflowDecision({
        decision,
        privateKey: oldKey.privateKey,
        keyId: "old",
        expiresAt,
      }),
    /expired/,
  );
  assert.throws(
    () =>
      signWorkflowDecision({
        decision,
        privateKey: oldKey.publicKey,
        keyId: "old",
        expiresAt: future(),
      }),
    /private key/,
  );
  assert.throws(
    () =>
      signWorkflowDecision({
        decision,
        privateKey: oldKey.privateKey,
        keyId: "",
        expiresAt: future(),
      }),
    /proof/,
  );
});

test("task idempotency keys survive retry and checkpoint replay but separate tasks and executions", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-idempotency-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: workflowCheckpointStore({
      transporter: localTransport({ directory }),
    }),
    runId: "keys",
    version: "1",
  };
  const keys: string[] = [];
  let fail = true;
  const job = task({
    key: "effect",
    retry: { attempts: 2 },
    perform(context) {
      keys.push(context.idempotencyKey);
      if (fail) throw new Error("interrupted");
      return context.idempotencyKey;
    },
  });
  const graph = workflow("keys", [job]);
  assert.equal((await graph.start({ checkpoint })).status, "failed");
  fail = false;
  const resumed = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  resumed.unwrap();
  assert.equal(new Set(keys).size, 1);
  assert.equal(keys.length, 3);
  const fresh = await graph.start();
  assert.notEqual(fresh.value(job), resumed.value(job));
  const other = task({
    key: "other",
    perform: (context) => context.idempotencyKey,
  });
  const together = await workflow("distinct", [job, other]).start();
  assert.notEqual(together.value(job), together.value(other));
});

test("signed pause decisions validate a whole batch before persisting and resist async mutation", async (t) => {
  const { pauseTask } = await import("../../src/index.ts");
  const directory = await mkdtemp(join(tmpdir(), "outpost-signed-batch-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: workflowCheckpointStore({
      transporter: localTransport({ directory }),
    }),
    runId: "batch",
    version: "1",
  };
  const gates = ["first", "second"].map((key) =>
    pauseTask({
      key,
      prompt: "Continue?",
      actors: ["maintainer"],
      authentication: "signed",
    }),
  );
  const graph = workflow("batch", gates);
  const first = await graph.start({ checkpoint });
  const decisions = first.tasks.map((record) =>
    signWorkflowDecision({
      decision: {
        executionId: first.executionId,
        key: record.key,
        requestId: record.pause!.id,
        action: "resume",
        actor: "maintainer",
        reason: "Ready",
      },
      keyId: "old",
      privateKey: oldKey.privateKey,
      expiresAt: future(),
    }),
  );
  const keys = [
    { keyId: "old", actor: "maintainer", publicKey: oldKey.publicKey },
    { keyId: "new", actor: "maintainer", publicKey: newKey.publicKey },
  ];
  const verifier = ed25519DecisionVerifier({ keys: () => keys });
  await assert.rejects(
    graph.start({
      checkpoint,
      decisions: [decisions[0]!, { ...decisions[1]!, reason: "Altered" }],
      decisionVerifier: verifier,
    }),
    /signature/,
  );
  const unchanged = await graph.start({ checkpoint });
  assert.ok(
    unchanged.tasks.every(
      (record) => record.status === "paused" && !record.decision,
    ),
  );
  await assert.rejects(
    graph.start({
      checkpoint,
      decisions,
      decisionVerifier: () => ({
        keyId: "wrong",
        verifiedAt: new Date().toISOString(),
      }),
    }),
    /verification/,
  );
  const mutable = decisions.map((decision) => ({
    ...decision,
    proof: { ...decision.proof! },
  }));
  const result = await graph.start({
    checkpoint,
    decisions: mutable,
    decisionVerifier: async (snapshot) => {
      mutable[1]!.actor = "intruder";
      mutable[1]!.proof.signature = "changed";
      return verifier(snapshot);
    },
  });
  result.unwrap();
  assert.ok(
    result.tasks.every((record) => record.decision?.actor === "maintainer"),
  );
});

test("public verifier snapshots decisions before asynchronous key resolution", async () => {
  const signed = signWorkflowDecision({
    decision: {
      executionId: "run",
      key: "task",
      requestId: "request",
      action: "approve",
      actor: "maintainer",
      reason: "Reviewed",
    },
    keyId: "old",
    privateKey: oldKey.privateKey,
    expiresAt: future(),
  });
  const mutable = { ...signed, proof: { ...signed.proof! } };
  const verifier = ed25519DecisionVerifier({
    keys: async () => {
      mutable.actor = "intruder";
      mutable.proof.expiresAt = "2000-01-01T00:00:00Z";
      return [
        { keyId: "old", actor: "maintainer", publicKey: oldKey.publicKey },
      ];
    },
  });
  assert.equal((await verifier(mutable)).keyId, "old");
});

test("a workflow deadline during signature verification cannot persist a late approval", async (t) => {
  const { setTimeout: delay } = await import("node:timers/promises");
  const directory = await mkdtemp(join(tmpdir(), "outpost-signed-deadline-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: workflowCheckpointStore({
      transporter: localTransport({ directory }),
    }),
    runId: "deadline",
    version: "1",
  };
  const gate = approvalTask({
    key: "review",
    prompt: "Ship?",
    actors: ["maintainer"],
    authentication: "signed",
  });
  const graph = workflow("deadline", [gate]);
  const paused = await graph.start({ checkpoint });
  const decision = signWorkflowDecision({
    decision: {
      executionId: paused.executionId,
      key: gate.key,
      requestId: paused.tasks[0]!.pause!.id,
      actor: "maintainer",
      reason: "Reviewed",
      action: "approve",
    },
    privateKey: oldKey.privateKey,
    keyId: "old",
    expiresAt: future(),
  });
  const decisionVerifier = ed25519DecisionVerifier({
    keys: async () => {
      await delay(50);
      return [
        { keyId: "old", actor: "maintainer", publicKey: oldKey.publicKey },
      ];
    },
  });
  const result = await graph.start({
    checkpoint,
    decisions: [decision],
    decisionVerifier,
    timeoutMs: 10,
  });
  assert.equal(result.status, "failed");
  assert.equal(result.tasks[0]!.status, "paused");
  assert.equal(result.tasks[0]!.decision, undefined);
  const restored = await graph.start({ checkpoint });
  assert.equal(restored.status, "paused");
  assert.equal(restored.tasks[0]!.decision, undefined);
});
