import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  dispatch,
  createSandbox,
  reporter,
  recoveryDetails,
  openWorkspace,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { transfer } from "../../src/infrastructure/transfer.ts";
import { downloadTree } from "../../src/providers/cloud-files.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { emit, repository, scripted } from "../helpers.ts";

test("human reporter exposes phases, duration and raw token counts while quiet mode writes nothing", () => {
  let normal = "",
    verbose = "",
    quiet = "";
  const sinks = [
    reporter({ label: "job", write: (text) => (normal += text) }),
    reporter({ verbose: true, write: (text) => (verbose += text) }),
    reporter({ quiet: true, write: (text) => (quiet += text) }),
  ];
  for (const sink of sinks) {
    sink({
      kind: "phase",
      name: "running",
      agent: "fixture",
      branch: "topic",
      directory: "/work",
      pass: 2,
    });
    sink({ kind: "prompt", text: "brief" });
    sink({ kind: "raw", value: "raw-line" });
    sink({ kind: "conversation", id: "id" });
    sink({ kind: "result", text: "final-only" });
    sink({ kind: "text", text: "answer" });
    sink({ kind: "result", text: "answer" });
    sink({ kind: "tool", name: "read", input: { path: "x" } });
    sink({ kind: "step", index: 3 });
    sink({ kind: "text-delta", text: "str" });
    sink({ kind: "text-delta", text: "eamed" });
    sink({ kind: "text", text: "streamed" });
    sink({ kind: "compaction", strategy: "summarize-history", messages: 4 });
    sink({ kind: "tool-denied", callId: "d", name: "rm", reason: "unsafe" });
    sink({ kind: "stop-prevented", message: "run tests first" });
    sink({
      kind: "tool-result",
      callId: "c",
      name: "read",
      isError: true,
      preview: "missing-file",
      characters: 12,
    });
    sink({ kind: "warning", message: "idle" });
    sink({ kind: "failure", message: "failed" });
    sink({
      kind: "summary",
      durationMs: 1234,
      status: 0,
      tokens: { input: 3, cached: 4, cacheCreated: 5, output: 6 },
      pass: 2,
    });
  }
  assert.match(normal, /\[job · pass 2\] running · fixture · topic/);
  assert.match(
    normal,
    /1.23s · status 0 · input 3 · cache read 4 · cache write 5 · output 6/,
  );
  assert.match(normal, /final-only/);
  assert.equal(normal.match(/answer/g)?.length, 1);
  assert.doesNotMatch(normal, /raw-line|brief|\/work/);
  assert.match(normal, /tool failed: read\n/);
  assert.match(normal, /tool denied: rm · unsafe/);
  assert.match(normal, /stop prevented: run tests first/);
  assert.doesNotMatch(normal, /missing-file|step 3/);
  assert.match(verbose, /tool failed: read missing-file/);
  assert.match(verbose, /step 3/);
  assert.equal(normal.match(/streamed/g)?.length, 1);
  assert.match(verbose, /context compacted by summarize-history · 4 messages/);
  assert.doesNotMatch(normal, /context compacted/);
  assert.match(verbose, /raw-line/);
  assert.match(verbose, /\/work/);
  assert.equal(quiet, "");
});

test("idle diagnostics repeat before timeout and error recovery preserves the journal and workspace", async (t) => {
  const root = await repository(t),
    warnings: string[] = [];
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: scripted("setTimeout(()=>{},10000)"),
      branch: { mode: "named", name: "idle-test" },
      brief: { text: "wait" },
      idleMs: 130,
      idleWarningMs: 20,
      warn: (message) => warnings.push(message),
    }),
    (error) => {
      const recovery = recoveryDetails(error);
      assert.equal(recovery?.branch, "idle-test");
      assert.equal(typeof recovery?.log, "string");
      return true;
    },
  );
  assert.ok(warnings.length >= 2);
});

test("preparation errors are journaled and sibling hooks are cancelled", async (t) => {
  const root = await repository(t);
  let error: unknown;
  try {
    await createSandbox({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      branch: { mode: "named", name: "hook-errors" },
      hooks: {
        hostReady: [
          {
            executable: process.execPath,
            arguments: ["-e", "process.exit(1)"],
          },
        ],
        sandboxReady: [
          {
            executable: process.execPath,
            arguments: ["-e", "setTimeout(()=>{},10000)"],
            deadlineMs: 2000,
          },
        ],
      },
    });
  } catch (cause) {
    error = cause;
  }
  const recovery = recoveryDetails(error);
  assert.equal(recovery?.branch, "hook-errors");
  assert.match(
    await readFile(recovery!.log as string, "utf8"),
    /preparation failed/,
  );
});

test("transfers have a deadline and late cloud responses cannot write after cancellation", async (t) => {
  await assert.rejects(
    transfer({ deadlineMs: 10 }, () => new Promise(() => {})),
    /timed out/,
  );
  const root = await repository(t),
    destination = join(root, "late.txt");
  let complete!: (value: Buffer) => void;
  const delayed = new Promise<Buffer>((resolve) => {
    complete = resolve;
  });
  await assert.rejects(
    transfer({ deadlineMs: 10 }, (signal) =>
      downloadTree(
        "/remote",
        destination,
        '[{"path":"","kind":"file","mode":420}]',
        () => delayed,
        signal,
      ),
    ),
    /timed out/,
  );
  complete(Buffer.from("late"));
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(readFile(destination));
  const reason = new Error("stop transfer");
  await assert.rejects(
    transfer({ signal: AbortSignal.abort(reason) }, async () =>
      assert.fail("must not start"),
    ),
    (error) => error === reason,
  );
});

test("remote provisioning bounds uploads and retries only transient Git setup failures", async (t) => {
  const root = await repository(t);
  let released = 0;
  await assert.rejects(
    createSandbox({
      repository: root,
      limits: { copyMs: 15 },
      sandboxProvider: {
        name: "stalled",
        placement: "remote",
        async acquire() {
          return {
            root: "/work",
            home: "/home/agent",
            async invoke() {
              return { status: 0, stdout: "", stderr: "" };
            },
            upload: () => new Promise(() => {}),
            async download() {},
            async release() {
              released++;
            },
          };
        },
      },
    }),
    /timed out/,
  );
  assert.equal(released, 1);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "retry-setup" },
  });
  t.after(() => workspace.close());
  const remote = join(root, ".outpost", "recovery", "retry-remote");
  await mkdir(remote, { recursive: true });
  const lease = await localSandboxProvider().acquire({
    repository: remote,
    directory: remote,
    variables: {},
    gitDirectories: [],
  });
  t.after(() => lease.release());
  let attempts = 0;
  const sync = await seedRemote(
    workspace,
    {
      ...lease,
      async invoke(command) {
        if (command.arguments?.[0] === "init" && ++attempts < 3)
          return { status: 126, stdout: "", stderr: "starting" };
        return lease.invoke(command);
      },
    },
    { limits: { gitMs: 12345 } },
  );
  assert.equal(attempts, 3);
  await sync.close();
  let permanent = 0;
  await assert.rejects(
    seedRemote(workspace, {
      ...lease,
      async invoke() {
        permanent++;
        return { status: 1, stdout: "", stderr: "denied" };
      },
    }),
    /Remote Git/,
  );
  assert.equal(permanent, 1);
});

test("scaffolding falls back for malformed metadata and detects the package manager", async (t) => {
  const { initialize } = await import("../../src/cli/scaffold.ts");
  const root = await repository(t),
    malformed = join(root, "malformed"),
    unknown = join(root, "unknown");
  await mkdir(malformed);
  await mkdir(unknown);
  await writeFile(join(malformed, "package.json"), "{broken");
  assert.equal((await initialize({ directory: malformed })).run, "node run.ts");
  await writeFile(
    join(unknown, "package.json"),
    '{"packageManager":"other@1"}',
  );
  await writeFile(join(unknown, "pnpm-lock.yaml"), "");
  const commands: string[] = [];
  await initialize(
    { directory: unknown, sandboxProvider: "docker", install: true },
    async (command) => {
      commands.push(command.executable + " " + command.arguments?.join(" "));
      return { status: 0, stdout: "", stderr: "" };
    },
  );
  assert.match(commands[0]!, /pnpm/);
});

test("local elevated commands run as the current account without escalation", async (t) => {
  const root = await repository(t);
  const box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  try {
    const output = await box.command({
      executable: process.execPath,
      arguments: [
        "-e",
        "console.log(JSON.stringify({uid:process.getuid?.()??null,username:process.env.USERNAME??null}))",
      ],
      elevated: true,
    });
    assert.equal(output.status, 0, output.stderr);
    assert.deepEqual(JSON.parse(output.stdout), {
      uid: process.getuid?.() ?? null,
      username: process.env.USERNAME ?? null,
    });
  } finally {
    await box.close();
  }
});
