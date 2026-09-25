import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { speculate } from "../../src/index.ts";
import { git } from "../../src/infrastructure/git.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const usage = `console.log(JSON.stringify({ kind: "usage", tokens: { input: 3, cached: 0, output: 1 } }));`;
const candidate = (key: string, script = emit("done")) => ({
  key,
  agent: scripted(script),
  request: { brief: { text: "fixture" } },
});

test("speculation selects a validated candidate, cancels dirty loser and awaits releases", async (t) => {
  const repo = await repository(t);
  let markReady = () => {};
  const ready = new Promise<void>((resolve) => {
    markReady = resolve;
  });
  const released: string[] = [];
  const sandboxProvider = localSandboxProvider();
  const result = await speculate({
    repository: repo,
    sandboxProvider: {
      ...sandboxProvider,
      async acquire(context) {
        const lease = await sandboxProvider.acquire(context);
        return {
          ...lease,
          async release() {
            await lease.release();
            released.push(context.directory);
          },
        };
      },
    },
    candidates: [
      candidate(
        "winner",
        `import { writeFileSync } from "node:fs"; import { execFileSync } from "node:child_process"; writeFileSync("solution.txt", "winner"); execFileSync("git", ["add", "solution.txt"]); execFileSync("git", ["commit", "-m", "Candidate solution"]); ${emit("done")}`,
      ),
      {
        ...candidate(
          "loser",
          `import { writeFileSync } from 'node:fs'; writeFileSync('unfinished.txt', 'keep'); ${usage} setInterval(() => {}, 1000);`,
        ),
        request: {
          brief: { text: "fixture" },
          observe(event) {
            if (event.kind === "usage") markReady();
          },
        },
      },
      candidate("queued"),
    ],
    budget: { attempts: 3, usage: { input: 100 } },
    async validate({ sandbox, signal }) {
      await ready;
      const command = await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
        signal,
      });
      return command.status === 0;
    },
  });
  assert.equal(result.status, "winner");
  assert.equal(result.winner?.key, "winner");
  assert.equal(released.length, 2);
  assert.equal(result.candidates[1]?.status, "cancelled");
  assert.equal(result.candidates[2]?.status, "skipped");
  assert.equal(
    await readFile(
      join(result.candidates[1]!.retainedDirectory!, "unfinished.txt"),
      "utf8",
    ),
    "keep",
  );
  assert.equal(result.usage.tokens.input, 3);
  assert.equal(result.host.changed, false);
  assert.equal(
    (await git(repo, ["rev-parse", "HEAD"])).trim(),
    result.baseline,
  );
  await assert.rejects(access(result.winner!.directory!));
  assert.notEqual(
    (await git(repo, ["rev-parse", result.winner!.branch])).trim(),
    result.baseline,
  );
  assert.equal(
    result.winner?.result?.commits[0]?.subject,
    "Candidate solution",
  );
  assert.equal(
    await git(repo, ["show", `${result.winner!.branch}:solution.txt`]),
    "winner",
  );
});

test("sequential candidates keep the initial commit despite concurrent host edits", async (t) => {
  const repo = await repository(t);
  const baselines: string[] = [];
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    concurrency: 1,
    candidates: [candidate("first"), candidate("second")],
    budget: {},
    async validate({ key, sandbox }) {
      baselines.push(sandbox.workspace.baseline);
      if (key === "first") {
        await writeFile(join(repo, "base.txt"), "host commit\n");
        await git(repo, ["commit", "-am", "Host update"]);
        await writeFile(join(repo, "untracked.txt"), "host work");
        return false;
      }
      assert.equal(
        await readFile(join(sandbox.workspace.directory, "base.txt"), "utf8"),
        "base\n",
      );
      return true;
    },
  });
  assert.deepEqual(baselines, [result.baseline, result.baseline]);
  assert.equal(result.host.changed, true);
  assert.equal(result.host.after?.dirty, true);
  assert.equal(
    await readFile(join(repo, "untracked.txt"), "utf8"),
    "host work",
  );
});

test("validation rejection, exceptions and agent failures produce no winner with recovery", async (t) => {
  const repo = await repository(t);
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    concurrency: 1,
    candidates: [
      candidate("rejected"),
      candidate("invalid"),
      candidate("failed", `${usage} process.exitCode = 7;`),
    ],
    budget: {},
    validate({ key }) {
      if (key === "invalid") throw new Error("validation exploded");
      return false;
    },
  });
  assert.equal(result.status, "no-winner");
  assert.deepEqual(
    result.candidates.map((value) => value.status),
    ["rejected", "failed", "failed"],
  );
  assert.match(String(result.candidates[1]?.error), /validation exploded/);
  assert.ok(result.candidates[1]?.result);
  assert.ok(result.candidates[2]?.retainedDirectory);
  assert.equal(result.usage.tokens.input, 3);
});

test("streaming usage cancels admitted work and counts failed attempts", async (t) => {
  const repo = await repository(t);
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    concurrency: 1,
    candidates: [
      candidate("expensive", `${usage} setInterval(() => {}, 1000);`),
      candidate("queued"),
    ],
    budget: { usage: { input: 3 } },
    validate: () => assert.fail("budget exceeded"),
  });
  assert.equal(result.status, "budget-exhausted");
  assert.equal(result.usage.tokens.input, 3);
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.candidates[1]?.status, "skipped");
});

test("attempt caps stop admission without cancelling an admitted candidate", async (t) => {
  const repo = await repository(t);
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate("first"), candidate("second")],
    budget: { attempts: 1 },
    validate: () => true,
  });
  assert.equal(result.status, "winner");
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.candidates[1]?.status, "skipped");
  const empty = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate("blocked")],
    budget: { attempts: 0 },
    validate: () => true,
  });
  assert.equal(empty.status, "budget-exhausted");
  assert.equal(empty.usage.attempts, 0);
});

test("external abort returns owned recovery after cancelling a running command", async (t) => {
  const repo = await repository(t);
  const controller = new AbortController();
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    signal: controller.signal,
    candidates: [
      {
        ...candidate("active", `${usage} setInterval(() => {}, 1000);`),
        request: {
          brief: { text: "fixture" },
          observe(event) {
            if (event.kind === "usage") controller.abort(new Error("stop"));
          },
        },
      },
    ],
    budget: {},
    validate: () => false,
  });
  assert.equal(result.status, "aborted");
  assert.equal(result.candidates[0]?.status, "cancelled");
  await access(result.candidates[0]!.retainedDirectory!);
});

test("cleanup failure prevents selection and preserves output and workspace", async (t) => {
  const repo = await repository(t);
  const sandboxProvider = localSandboxProvider();
  const result = await speculate({
    repository: repo,
    sandboxProvider: {
      ...sandboxProvider,
      async acquire(context) {
        const lease = await sandboxProvider.acquire(context);
        return {
          ...lease,
          async release() {
            await lease.release();
            throw new Error("cleanup failure");
          },
        };
      },
    },
    candidates: [candidate("candidate")],
    budget: {},
    validate: () => true,
  });
  assert.equal(result.status, "no-winner");
  assert.equal(result.candidates[0]?.status, "failed");
  assert.match(String(result.candidates[0]?.error), /cleanup failure/);
  assert.ok(result.candidates[0]?.result);
  await access(result.candidates[0]!.retainedDirectory!);
});

test("speculation validates bounded candidate definitions before allocation", async (t) => {
  const repo = await repository(t);
  const options = {
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate("first")],
    budget: {},
    validate: () => true,
  };
  await assert.rejects(
    speculate({ ...options, candidates: [] }),
    /requires 1 to 8/,
  );
  await assert.rejects(
    speculate({
      ...options,
      candidates: [candidate("same"), candidate("same")],
    }),
    /unique simple names/,
  );
  await assert.rejects(
    speculate({ ...options, concurrency: 9 }),
    /concurrency/,
  );
  await assert.rejects(
    speculate({ ...options, budget: { attempts: -1 } }),
    /nonnegative/,
  );
});

test("validation rejection preserves its dirty test output", async (t) => {
  const repo = await repository(t);
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate("rejected")],
    budget: {},
    async validate({ sandbox }) {
      await writeFile(
        join(sandbox.workspace.directory, "test-output.txt"),
        "retained",
      );
      return false;
    },
  });
  assert.equal(result.candidates[0]?.status, "rejected");
  assert.equal(
    await readFile(
      join(result.candidates[0]!.retainedDirectory!, "test-output.txt"),
      "utf8",
    ),
    "retained",
  );
});

test("loser cleanup failures stay visible after another candidate wins", async (t) => {
  const repo = await repository(t);
  let markReady = () => {};
  const ready = new Promise<void>((resolve) => {
    markReady = resolve;
  });
  const sandboxProvider = localSandboxProvider();
  const result = await speculate({
    repository: repo,
    sandboxProvider: {
      ...sandboxProvider,
      async acquire(context) {
        const lease = await sandboxProvider.acquire(context);
        const branch = (
          await git(context.directory, ["branch", "--show-current"])
        ).trim();
        return {
          ...lease,
          async release() {
            await lease.release();
            if (branch.endsWith("/loser"))
              throw new Error("loser cleanup failed");
          },
        };
      },
    },
    candidates: [
      candidate("winner"),
      {
        ...candidate("loser", `${usage} setInterval(() => {}, 1000);`),
        request: {
          brief: { text: "fixture" },
          observe(event) {
            if (event.kind === "usage") markReady();
          },
        },
      },
    ],
    budget: {},
    async validate() {
      await ready;
      return true;
    },
  });
  assert.equal(result.status, "winner");
  assert.equal(result.candidates[1]?.status, "failed");
  const error = result.candidates[1]?.error;
  assert.ok(error instanceof AggregateError);
  assert.match(String(error.errors[1]), /loser cleanup failed/);
  await access(result.candidates[1]!.retainedDirectory!);
});
