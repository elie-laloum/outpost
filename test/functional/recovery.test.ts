import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createSandbox,
  dispatch,
  openWorkspace,
  response,
  ResponseError,
  agentTask,
  commandTask,
  isolatedTask,
  workflow,
} from "../../src/index.ts";
import { local } from "../../src/providers/local.ts";
import { shell } from "../../src/infrastructure/process.ts";
import { repository, scripted, emit } from "../helpers.ts";

test("idle and completion watchdogs have distinct outcomes and allow reuse", async (t) => {
  const root = await repository(t);
  let complete = false;
  const box = await createSandbox({
    repository: root,
    provider: local(),
    agent: scripted(
      () =>
        (complete ? emit("finished-marker") : "") + "setInterval(()=>{},1000)",
    ),
    logging: false,
  });
  t.after(() => box.close());
  await assert.rejects(
    box.dispatch({ brief: { text: "wait" }, idleMs: 80 }),
    /idle deadline/,
  );
  complete = true;
  const warnings: string[] = [];
  const output = await box.dispatch({
    brief: { text: "finish" },
    until: ["finished-marker"],
    settleMs: 30,
    idleMs: 10_000,
    warn: (message) => warnings.push(message),
  });
  assert.equal(output.completed, true);
  assert.equal(output.completion, "finished-marker");
  assert.equal(warnings.length, 1);
});

test("prompt commands run after hooks and fail with diagnostics", async (t) => {
  const root = await repository(t),
    warnings: string[] = [];
  await writeFile(
    join(root, "brief.md"),
    "{{INPUT}} !`echo expanded` {{WORK_BRANCH}}",
  );
  const agent = scripted(
    "let text=''; for await (const x of process.stdin) text+=x; console.log(JSON.stringify({kind:'text',text}));",
  );
  const box = await createSandbox({
    repository: root,
    provider: local(),
    agent,
    logging: false,
    hooks: {
      workspaceReady: [
        {
          executable: process.execPath,
          arguments: ["-e", "require('fs').writeFileSync('hook.txt','ready')"],
        },
      ],
      hostReady: [shell("echo host")],
      sandboxReady: [shell("echo sandbox")],
    },
  });
  t.after(() => box.close());
  const output = await box.dispatch({
    brief: {
      file: "brief.md",
      values: { INPUT: "!`not-executed`", EXTRA: "unused" },
    },
    warn: (message) => warnings.push(message),
  });
  assert.equal(output.text, "!`not-executed` expanded main");
  assert.equal(warnings.length, 1);
  assert.equal(await readFile(join(root, "hook.txt"), "utf8"), "ready");
  await writeFile(join(root, "brief.md"), "!`exit 8`");
  await assert.rejects(
    box.dispatch({ brief: { file: "brief.md" } }),
    /Prompt command failed/,
  );
});

test("structured failures retain recovery metadata and release workspace locks", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    dispatch({
      repository: root,
      provider: local(),
      agent: scripted(emit("invalid")),
      logging: false,
      branch: { mode: "named", name: "invalid-result" },
      brief: { text: "Return <data>" },
      response: response.text({ tag: "data" }),
    }),
    (error) => {
      assert.ok(error instanceof ResponseError);
      assert.equal(error.recovery.branch, "invalid-result");
      assert.ok(Array.isArray(error.recovery.commits));
      return true;
    },
  );
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "invalid-result" },
  });
  await workspace.close();
  await assert.rejects(
    createSandbox({
      repository: root,
      provider: local(),
      agent: scripted(""),
      hooks: {
        sandboxReady: [
          {
            executable: process.execPath,
            arguments: ["-e", "process.exit(4)"],
          },
        ],
      },
    }),
    /status 4/,
  );
  const released = await openWorkspace({ repository: root });
  await released.close();
});

test("workflow convenience tasks share sequential sandboxes and isolate fanout", async (t) => {
  const root = await repository(t),
    box = await createSandbox({
      repository: root,
      provider: local(),
      agent: scripted(emit("answer")),
      logging: false,
    });
  t.after(() => box.close());
  const a = agentTask({
    key: "agent",
    sandbox: box,
    request: () => ({ brief: { text: "hello" } }),
  });
  const b = commandTask({
    key: "verify",
    after: [a],
    sandbox: box,
    command: () => ({
      executable: process.execPath,
      arguments: ["-e", "console.log('verified')"],
    }),
  });
  const c = isolatedTask({
    key: "isolated",
    request: () => ({
      repository: root,
      provider: local(),
      agent: scripted(emit("isolated")),
      logging: false,
      branch: { mode: "named", name: "isolated-task" },
      brief: { text: "hello" },
    }),
  });
  const result = await workflow("helpers", [a, b, c]).start({ concurrency: 2 });
  result.unwrap();
  assert.equal(result.value(a).text, "answer");
  assert.equal(result.value(c).text, "isolated");
  const bad = commandTask({
    key: "bad",
    sandbox: box,
    command: {
      executable: process.execPath,
      arguments: ["-e", "process.exit(9)"],
    },
  });
  assert.equal((await workflow("failure", [bad]).start()).status, "failed");
});

test("native cold continuation preflight happens before provisioning", async (t) => {
  const root = await repository(t),
    home = join(root, "home");
  await mkdir(home);
  let acquired = false;
  const provider = {
    ...local(),
    async acquire() {
      acquired = true;
      throw new Error("must not provision");
    },
  };
  await assert.rejects(
    dispatch({
      repository: root,
      provider,
      agent: { ...scripted(""), conversations: "codex" },
      conversationHome: home,
      brief: { text: "hello" },
      continuation: { id: "missing" },
    }),
    /not found/,
  );
  assert.equal(acquired, false);
});
