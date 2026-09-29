import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { createLocalTransport, speculate } from "../../src/index.ts";
import type { SandboxProvider, TransportEntry } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const limited = (resetAt?: string) =>
  [
    { kind: "quota", message: "limit", ...(resetAt ? { resetAt } : {}) },
    { kind: "failure", message: "Usage limit" },
  ]
    .map((line) => `console.log(${JSON.stringify(JSON.stringify(line))});`)
    .join("") + "process.exit(1);";

function recoverable(): SandboxProvider {
  const local = createLocalSandboxProvider();
  return {
    ...local,
    recover: async () => {},
    async acquire(context) {
      await context.registerRecovery?.("fixture-resource");
      return local.acquire(context);
    },
  };
}

test("candidates stopped by a quota report quota with the earliest reset", async (t) => {
  const repo = await repository(t);
  const early = "2026-09-28T18:00:00.000Z";
  const result = await speculate({
    repository: repo,
    sandboxProvider: createLocalSandboxProvider(),
    concurrency: 1,
    candidates: [
      { key: "late", agent: scripted(limited("2026-09-29T00:00:00.000Z")) },
      { key: "early", agent: scripted(limited(early)) },
      { key: "broken", agent: scripted("process.exitCode = 7;") },
      { key: "rejected", agent: scripted(emit("done")) },
    ].map((candidate) => ({
      ...candidate,
      request: { brief: { text: "fixture" } },
    })),
    budget: {},
    validate: () => false,
  });
  assert.equal(result.status, "quota");
  assert.deepEqual(
    result.candidates.map((candidate) => candidate.status),
    ["quota", "quota", "failed", "rejected"],
  );
  assert.deepEqual(result.candidates[1]?.quota, {
    message: "limit",
    resetAt: early,
  });
  assert.equal(result.candidates[2]?.quota, undefined);
  assert.deepEqual(result.quota, { message: "limit", resetAt: early });
});

test("a winner still takes precedence over quota-stopped candidates", async (t) => {
  const result = await speculate({
    repository: await repository(t),
    sandboxProvider: createLocalSandboxProvider(),
    concurrency: 1,
    candidates: [
      { key: "limited", agent: scripted(limited()) },
      { key: "good", agent: scripted(emit("done")) },
    ].map((candidate) => ({
      ...candidate,
      request: { brief: { text: "fixture" } },
    })),
    budget: {},
    validate: () => true,
  });
  assert.equal(result.status, "winner");
  assert.equal(result.quota, undefined);
  assert.equal(result.candidates[0]?.status, "quota");
});

test("durable speculation reruns only quota-stopped candidates", async (t) => {
  const repo = await repository(t);
  const calls = { limited: 0, rejected: 0 };
  const options = {
    repository: repo,
    sandboxProvider: recoverable(),
    concurrency: 1,
    durability: {
      transporter: createLocalTransport({
        directory: join(repo, ".outpost", "storage"),
      }),
      runId: "quota",
      version: "1",
    },
    budget: { attempts: 4 },
    candidates: [
      {
        key: "limited",
        agent: scripted(() =>
          ++calls.limited === 1 ? limited() : emit("fixed"),
        ),
        request: { brief: { text: "fixture" } },
      },
      {
        key: "rejected",
        agent: scripted(() => {
          calls.rejected++;
          return emit("other");
        }),
        request: { brief: { text: "fixture" } },
      },
    ],
    validate: ({ key }: { key: string }) => key === "limited",
  };
  const first = await speculate(options);
  assert.equal(first.status, "quota");
  const second = await speculate(options);
  assert.equal(second.status, "winner", String(second.candidates[0]?.error));
  assert.equal(second.id, first.id);
  assert.equal(second.winner?.key, "limited");
  assert.equal(second.winner?.attempt, 2);
  assert.equal(second.candidates[1]?.status, "rejected");
  assert.deepEqual(calls, { limited: 2, rejected: 1 });
  assert.equal(second.usage.attempts, 3);
  assert.equal(second.previousAttempts?.[0]?.status, "quota");
  assert.equal(second.previousAttempts?.[0]?.quota?.message, "limit");
  const third = await speculate(options);
  assert.equal(third.status, "winner");
  assert.deepEqual(calls, { limited: 2, rejected: 1 });
});

test("durable speculation rejects quota records without their limit", async (t) => {
  const repo = await repository(t);
  const transporter = createLocalTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const options = {
    repository: repo,
    sandboxProvider: recoverable(),
    durability: { transporter, runId: "corrupt", version: "1" },
    candidates: [
      {
        key: "limited",
        agent: scripted(limited()),
        request: { brief: { text: "fixture" } },
      },
    ],
    budget: {},
    validate: () => true,
  };
  assert.equal((await speculate(options)).status, "quota");
  let current: TransportEntry | undefined;
  for await (const value of transporter.list("speculations/")) current = value;
  const stored = await transporter.read(current!.key);
  const envelope = JSON.parse(Buffer.from(stored!.bytes).toString()) as {
    state: { attempts: { record: Record<string, unknown> }[] };
  };
  delete envelope.state.attempts[0]!.record.quota;
  await transporter.write(current!.key, Buffer.from(JSON.stringify(envelope)), {
    ifRevision: current!.revision,
  });
  await assert.rejects(speculate(options), /incompatible/);
});
