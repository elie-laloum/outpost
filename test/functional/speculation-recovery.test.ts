import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  speculate,
  recoverSpeculation,
  localTransport,
  checkSpeculationIntegration,
  response,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository, scripted, emit } from "../helpers.ts";
import type { SandboxProvider, Transport } from "../../src/index.ts";

function recoverable(recovered: string[] = []): SandboxProvider {
  const local = localSandboxProvider();
  return {
    ...local,
    recover: async (id) => {
      recovered.push(id);
    },
    async acquire(context) {
      await context.registerRecovery?.("fixture-resource");
      return local.acquire(context);
    },
  };
}
async function entry(transporter: Transport) {
  for await (const value of transporter.list("speculations/")) return value;
  throw new Error("Missing checkpoint");
}
const candidate = {
  key: "candidate",
  agent: scripted(emit("done")),
  request: { brief: { text: "fixture" } },
};

test("durable completion is reused without allocation and preserves structured error fields", async (t) => {
  const repo = await repository(t);
  const transporter = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const parsed = response.json({ tag: "answer", schema: (value) => value });
  const options = {
    repository: repo,
    sandboxProvider: recoverable(),
    durability: { transporter, runId: "success", version: "1" },
    budget: { attempts: 2 },
    candidates: [
      {
        ...candidate,
        agent: scripted(emit('<answer>{"error":{"nested":true}}</answer>')),
        request: {
          brief: { text: "Return <answer> JSON </answer>" },
          response: parsed,
        },
      },
    ],
    validate: () => true,
  };
  const first = await speculate(options);
  const second = await speculate({
    ...options,
    sandboxProvider: {
      ...options.sandboxProvider,
      acquire: async () => assert.fail("must not allocate"),
    },
  });
  assert.equal(first.status, "winner", String(first.candidates[0]?.error));
  assert.equal(second.id, first.id);
  assert.deepEqual(second.winner?.result?.value, { error: { nested: true } });
  assert.equal(second.usage.attempts, 1);
  assert.equal(second.integration?.status, "clean");
});

for (const phase of ["allocation", "validation", "cleanup"])
  test(`coordinator SIGKILL during ${phase} requires explicit ownership recovery and replay`, async (t) => {
    const repo = await repository(t);
    const directory = join(repo, ".outpost", "storage");
    const transporter = localTransport({ directory });
    const child = spawn(
      process.execPath,
      [
        fileURLToPath(
          new URL("../fixtures/speculation-crash.ts", import.meta.url),
        ),
        repo,
        directory,
        phase,
      ],
      { stdio: ["ignore", "pipe", "pipe", "ipc"] },
    );
    t.after(() => {
      child.kill("SIGKILL");
    });
    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    await Promise.race([
      once(child, "message"),
      once(child, "exit").then(() => assert.fail(stderr)),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Crash fixture did not start: " + stderr)),
          15_000,
        );
        timer.unref();
      }),
    ]);
    const exited = once(child, "exit");
    child.kill("SIGKILL");
    await exited;
    const recovered: string[] = [];
    const options = {
      repository: repo,
      sandboxProvider: recoverable(recovered),
      durability: { transporter, runId: "crash", version: "1" },
      candidates: [candidate],
      budget: { attempts: 2 },
      validate: () => true,
    };
    await assert.rejects(speculate(options), /already owned/);
    let current = await entry(transporter);
    await assert.rejects(
      recoverSpeculation({
        transporter,
        runId: "crash",
        revision: "wrong",
        coordinatorStopped: true,
      }),
      /conflict/i,
    );
    await recoverSpeculation({
      transporter,
      runId: "crash",
      revision: current.revision,
      coordinatorStopped: true,
    });
    await assert.rejects(speculate(options), /retry-incomplete/);
    current = await entry(transporter);
    await recoverSpeculation({
      transporter,
      runId: "crash",
      revision: current.revision,
      coordinatorStopped: true,
    });
    const result = await speculate({
      ...options,
      durability: { ...options.durability, resume: "retry-incomplete" },
    });
    assert.equal(result.status, "winner");
    assert.equal(result.usage.attempts, phase === "cleanup" ? 1 : 2);
    if (phase !== "cleanup") assert.equal(result.usage.tokens.complete, false);
    assert.deepEqual(recovered, ["fixture-resource"]);
    if (phase === "cleanup") {
      assert.equal(result.previousAttempts?.length, 0);
      assert.equal(result.winner?.result?.text, "done");
      return;
    }
    assert.equal(result.previousAttempts?.length, 1);
    assert.equal(result.previousAttempts?.[0]?.status, "cancelled");
    assert.notEqual(
      result.previousAttempts?.[0]?.branch,
      result.winner?.branch,
    );
    assert.ok(result.previousAttempts?.[0]?.retainedDirectory);
  });

test("cleanup deadline retains ownership and can be recovered without replaying a settled candidate", async (t) => {
  const repo = await repository(t);
  const transporter = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const provider = recoverable();
  let finish = () => {};
  const blocked = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const options = {
    repository: repo,
    sandboxProvider: {
      ...provider,
      async acquire(context: Parameters<SandboxProvider["acquire"]>[0]) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async release() {
            await blocked;
            await lease.release();
          },
        };
      },
    },
    durability: { transporter, runId: "cleanup", version: "1" },
    cleanupMs: 30,
    candidates: [candidate],
    budget: { attempts: 1 },
    validate: () => true,
  };
  const result = await speculate(options);
  assert.equal(result.status, "no-winner");
  assert.equal(result.candidates[0]?.cleanup, "pending");
  await assert.rejects(speculate(options), /already owned/);
  finish();
  await recoverSpeculation({
    transporter,
    runId: "cleanup",
    revision: (await entry(transporter)).revision,
    coordinatorStopped: true,
  });
  const recovered: string[] = [];
  const resumed = await speculate({
    ...options,
    sandboxProvider: recoverable(recovered),
  });
  assert.equal(resumed.usage.attempts, 1);
  assert.equal(resumed.candidates[0]?.cleanup, "done");
  assert.deepEqual(recovered, ["fixture-resource"]);
});

test("aborted noncooperative validation returns with recoverable work within cleanup deadline", async (t) => {
  const repo = await repository(t);
  const controller = new AbortController();
  let complete = () => {};
  const pending = new Promise<void>((resolve) => {
    complete = resolve;
  });
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate],
    budget: {},
    cleanupMs: 30,
    signal: controller.signal,
    async validate({ sandbox }) {
      await writeFile(join(sandbox.workspace.directory, "keep.txt"), "recover");
      controller.abort();
      await pending;
      return true;
    },
  });
  assert.equal(result.status, "aborted");
  assert.equal(result.candidates[0]?.cleanup, "pending");
  assert.equal(
    await readFile(
      join(result.candidates[0]!.retainedDirectory!, "keep.txt"),
      "utf8",
    ),
    "recover",
  );
  complete();
});

test("integration preflight reports conflicts and dirty or detached hosts without changing files", async (t) => {
  const repo = await repository(t);
  await git(repo, ["checkout", "-b", "candidate"]);
  await writeFile(join(repo, "base.txt"), "candidate\n");
  await git(repo, ["commit", "-am", "candidate"]);
  await git(repo, ["checkout", "main"]);
  assert.equal(
    (await checkSpeculationIntegration(repo, "candidate")).status,
    "clean",
  );
  await writeFile(join(repo, "base.txt"), "host\n");
  assert.equal(
    (await checkSpeculationIntegration(repo, "candidate")).status,
    "blocked",
  );
  await git(repo, ["commit", "-am", "host"]);
  const conflict = await checkSpeculationIntegration(repo, "candidate");
  assert.equal(conflict.status, "conflict");
  assert.deepEqual(conflict.conflicts, ["base.txt"]);
  assert.equal(await readFile(join(repo, "base.txt"), "utf8"), "host\n");
  assert.equal((await git(repo, ["status", "--porcelain"])).trim(), "");
  assert.equal(
    (await checkSpeculationIntegration(repo, "missing")).status,
    "blocked",
  );
  await git(repo, ["checkout", "--detach"]);
  assert.equal(
    (await checkSpeculationIntegration(repo, "candidate")).status,
    "blocked",
  );
});

test("durability rejects unsupported providers and invalid deadlines before allocation", async (t) => {
  const repo = await repository(t);
  const options = {
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate],
    budget: {},
    validate: () => true,
  };
  await assert.rejects(speculate({ ...options, cleanupMs: 0 }), /cleanupMs/);
  await assert.rejects(
    speculate({
      ...options,
      durability: {
        transporter: localTransport({ directory: join(repo, "store") }),
        runId: "id",
        version: "1",
      },
    }),
    /does not support/,
  );
});

test("completed exhausted races retain their outcome and reject changed versions", async (t) => {
  const repo = await repository(t);
  const transporter = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const options = {
    repository: repo,
    sandboxProvider: recoverable(),
    durability: { transporter, runId: "budget", version: "1" },
    candidates: [candidate],
    budget: { attempts: 0 },
    validate: () => true,
  };
  const first = await speculate(options);
  assert.equal(first.status, "budget-exhausted");
  const second = await speculate(options);
  assert.equal(second.status, first.status);
  assert.equal(second.usage.attempts, 0);
  await assert.rejects(
    speculate({
      ...options,
      durability: { ...options.durability, version: "2" },
    }),
    /incompatible/,
  );
});

test("integration blocks a candidate ref changed since its validation", async (t) => {
  const repo = await repository(t);
  const result = await speculate({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [candidate],
    budget: {},
    validate: () => true,
  });
  assert.equal(result.integration?.status, "clean");
  await git(repo, ["checkout", result.winner!.branch]);
  await writeFile(join(repo, "base.txt"), "changed after validation");
  await git(repo, ["commit", "-am", "unvalidated"]);
  await git(repo, ["checkout", "main"]);
  const preflight = await checkSpeculationIntegration(
    repo,
    result.winner!.branch,
    result.winner!.commit,
  );
  assert.equal(preflight.status, "blocked");
  assert.match(preflight.reason!, /since validation/);
});

test("failed admission persistence prevents allocation and retains explicit ownership", async (t) => {
  const repo = await repository(t);
  const storage = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const transporter: Transport = {
    ...storage,
    async write(key, bytes, options) {
      if (Buffer.from(bytes).toString().includes('"phase":"running"'))
        throw new Error("storage unavailable");
      return storage.write(key, bytes, options);
    },
  };
  const provider = recoverable();
  const options = {
    repository: repo,
    sandboxProvider: {
      ...provider,
      acquire: async () => assert.fail("must persist before allocating"),
    },
    durability: { transporter, runId: "storage", version: "1" },
    candidates: [candidate],
    budget: {},
    validate: () => true,
  };
  await assert.rejects(speculate(options), /storage unavailable/);
  await assert.rejects(speculate(options), /already owned/);
});

test("durable outputs refuse lossy serialization", async (t) => {
  const repo = await repository(t);
  const transporter = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  await assert.rejects(
    speculate({
      repository: repo,
      sandboxProvider: recoverable(),
      durability: { transporter, runId: "lossless", version: "1" },
      candidates: [
        {
          ...candidate,
          agent: scripted(emit("<answer>{}</answer>")),
          request: {
            brief: { text: "Return <answer> JSON </answer>" },
            response: response.json({
              tag: "answer",
              schema: () => new Date(),
            }),
          },
        },
      ],
      budget: {},
      validate: () => true,
    }),
    /plain JSON/,
  );
});

test("checkpoint corruption is rejected before recovery or allocation", async (t) => {
  const repo = await repository(t);
  const transporter = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const options = {
    repository: repo,
    sandboxProvider: recoverable(),
    durability: { transporter, runId: "corrupt", version: "1" },
    candidates: [candidate],
    budget: {},
    validate: () => true,
  };
  await speculate(options);
  const current = await entry(transporter);
  const stored = await transporter.read(current.key);
  assert.ok(stored);
  const envelope: unknown = JSON.parse(Buffer.from(stored.bytes).toString());
  assert.ok(envelope && typeof envelope === "object" && "state" in envelope);
  const state = envelope.state;
  assert.ok(state && typeof state === "object" && "usage" in state);
  state.usage = { attempts: 0, tokens: { input: 0, cached: 0, output: 0 } };
  await transporter.write(current.key, Buffer.from(JSON.stringify(envelope)), {
    ifRevision: current.revision,
  });
  await assert.rejects(
    speculate({
      ...options,
      sandboxProvider: {
        ...options.sandboxProvider,
        acquire: async () => assert.fail("corrupt state must not allocate"),
        recover: async () =>
          assert.fail("corrupt state must not delete resources"),
      },
    }),
    /incompatible/,
  );
});

test("unprintable callback failures do not break durable error reporting", async (t) => {
  const repo = await repository(t);
  const transporter = localTransport({
    directory: join(repo, ".outpost", "storage"),
  });
  const options = {
    repository: repo,
    sandboxProvider: recoverable(),
    durability: { transporter, runId: "error", version: "1" },
    candidates: [candidate],
    budget: {},
    validate: () => {
      throw Object.create(null);
    },
  };
  const result = await speculate(options);
  assert.equal(result.status, "no-winner");
  const restored = await speculate(options);
  assert.equal(restored.candidates[0]?.error, "Unprintable speculation error");
});
