import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { createObservationHub, speculate } from "../../src/index.ts";
import type { SpeculationOptions } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";
import { git } from "../../src/infrastructure/git.ts";

const candidate = (key: string, output = 1) => ({
  key,
  agent: scripted(
    `console.log(JSON.stringify({ kind: "usage", tokens: { input: 3, cached: 0, output: ${output} } })); ${emit(key)}`,
  ),
  request: { brief: { text: "fixture" } },
});

test("best selection waits for cleanup, runs queued candidates and keeps losing dirty work", async (t) => {
  const repo = await repository(t);
  const provider = createLocalSandboxProvider();
  const released: string[] = [];
  const scored: string[] = [];
  const accepted: string[] = [];
  const observation = createObservationHub({
    sinks: [
      {
        observe(value) {
          if (
            value.event.kind === "candidate" &&
            value.event.status === "accepted"
          )
            accepted.push(value.scope.candidate!);
        },
      },
    ],
  });
  const result = await speculate({
    repository: repo,
    sandboxProvider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async release() {
            await lease.release();
            released.push(context.directory);
          },
        };
      },
    },
    observation,
    concurrency: 1,
    candidates: [
      candidate("first", 5),
      candidate("second", 3),
      candidate("last", 1),
    ],
    budget: { attempts: 3, usage: { output: 100 } },
    validate: () => true,
    select: "best",
    async score({ key, result, sandbox, signal }) {
      scored.push(key);
      assert.equal(signal.aborted, false);
      const check = await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
        signal,
      });
      assert.equal(check.status, 0);
      if (key === "first")
        await writeFile(
          join(sandbox.workspace.directory, "judge.txt"),
          "retain",
        );
      return -result.usage.output;
    },
  });
  assert.equal(result.status, "winner");
  assert.equal(result.winner?.key, "last", JSON.stringify(result));
  assert.equal(result.winner?.score, -1);
  assert.deepEqual(scored, ["first", "second", "last"]);
  assert.deepEqual(
    result.candidates.map((record) => record.status),
    ["rejected", "rejected", "winner"],
  );
  assert.deepEqual(
    result.candidates.map((record) => record.score),
    [-5, -3, -1],
  );
  assert.equal(released.length, 3);
  assert.equal(result.usage.attempts, 3);
  assert.equal(result.usage.tokens.output, 9);
  assert.deepEqual(accepted, ["last"]);
  assert.equal(
    await readFile(
      join(result.candidates[0]!.retainedDirectory!, "judge.txt"),
      "utf8",
    ),
    "retain",
  );
  await assert.rejects(access(result.candidates[1]!.directory!));
  await assert.rejects(access(result.winner!.directory!));
  assert.equal(result.host.changed, false);
  assert.equal(result.integration?.status, "clean");
});

test("equal scores use declaration order even when the second candidate finishes first", async (t) => {
  const repo = await repository(t);
  const provider = createLocalSandboxProvider();
  let releaseSecond = () => {};
  const secondClosed = new Promise<void>((resolve) => {
    releaseSecond = resolve;
  });
  const result = await speculate({
    repository: repo,
    sandboxProvider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async release() {
            await lease.release();
            releaseSecond();
          },
        };
      },
    },
    candidates: [candidate("first"), candidate("second")],
    budget: {},
    validate: () => true,
    select: "best",
    async score({ key }) {
      if (key === "first") await secondClosed;
      return 0;
    },
  });
  assert.equal(result.winner?.key, "first");
  assert.equal(result.winner.score, 0);
  assert.equal(result.candidates[1]?.status, "rejected");
});

test("rejected validation, invalid scores, judge failures and cleanup failures cannot win", async (t) => {
  const repo = await repository(t);
  const provider = createLocalSandboxProvider();
  const scored: string[] = [];
  const result = await speculate({
    repository: repo,
    sandboxProvider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        const branch = (
          await git(context.directory, ["branch", "--show-current"])
        ).trim();
        return {
          ...lease,
          async release() {
            await lease.release();
            if (branch.endsWith("/cleanup")) throw new Error("cleanup failed");
          },
        };
      },
    },
    concurrency: 1,
    candidates: ["invalid", "nan", "infinite", "judge", "cleanup", "valid"].map(
      (key) => candidate(key),
    ),
    budget: {},
    validate: ({ key }) => key !== "invalid",
    select: "best",
    score({ key }) {
      scored.push(key);
      if (key === "nan") return NaN;
      if (key === "infinite") return Infinity;
      if (key === "judge") throw new Error("judge failed");
      if (key === "cleanup") return 100;
      return -10;
    },
  });
  assert.equal(result.winner?.key, "valid");
  assert.deepEqual(scored, ["nan", "infinite", "judge", "cleanup", "valid"]);
  assert.deepEqual(
    result.candidates.map((record) => record.status),
    ["rejected", "failed", "failed", "failed", "failed", "winner"],
  );
  assert.match(String(result.candidates[1]?.error), /finite number/);
  assert.match(String(result.candidates[2]?.error), /finite number/);
  assert.match(String(result.candidates[3]?.error), /judge failed/);
  assert.match(String(result.candidates[4]?.error), /cleanup failed/);
  await access(result.candidates[3]!.retainedDirectory!);
});

test("best selection respects admission limits without stopping admitted candidates", async (t) => {
  const repo = await repository(t);
  const result = await speculate({
    repository: repo,
    sandboxProvider: createLocalSandboxProvider(),
    concurrency: 1,
    candidates: [candidate("first"), candidate("queued")],
    budget: { attempts: 1 },
    validate: () => true,
    select: "best",
    score: () => 1,
  });
  assert.equal(result.status, "winner");
  assert.equal(result.winner?.key, "first");
  assert.equal(result.candidates[1]?.status, "skipped");
  assert.equal(result.usage.attempts, 1);
});

for (const cause of ["abort", "tokens"])
  test(`best selection does not promote a partial result after ${cause}`, async (t) => {
    const repo = await repository(t);
    const controller = new AbortController();
    const result = await speculate({
      repository: repo,
      sandboxProvider: createLocalSandboxProvider(),
      concurrency: 1,
      candidates: [candidate("finished"), candidate("stopped")],
      budget: cause === "tokens" ? { usage: { output: 2 } } : {},
      signal: controller.signal,
      validate: () => true,
      select: "best",
      score({ key }) {
        if (key === "stopped") controller.abort();
        return 1;
      },
    });
    assert.equal(
      result.status,
      cause === "tokens" ? "budget-exhausted" : "aborted",
    );
    assert.equal(result.winner, undefined);
    assert.equal(result.candidates[0]?.score, 1);
    assert.equal(result.candidates[1]?.status, "cancelled");
  });

test("best selection validates score configuration before allocating resources", async (t) => {
  const options: SpeculationOptions = {
    repository: await repository(t),
    sandboxProvider: {
      ...createLocalSandboxProvider(),
      acquire: async () => assert.fail("must not allocate"),
    },
    candidates: [candidate("fixture")],
    budget: {},
    validate: () => true,
  };
  await assert.rejects(
    speculate({ ...options, select: "best" }),
    /requires score/,
  );
  await assert.rejects(
    speculate({ ...options, score: () => 1 }),
    /requires select best/,
  );
  await assert.rejects(
    speculate({ ...options, select: "first", score: () => 1 }),
    /requires select best/,
  );
});
