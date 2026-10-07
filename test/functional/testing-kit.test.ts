import assert from "node:assert/strict";
import { readFile, writeFile, symlink } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import {
  createSandbox,
  defineAgentTask,
  defineCommandTask,
  defineWorkflow,
  dispatch,
  defineTextResponse,
  OutpostError,
} from "../../src/index.ts";
import {
  scriptedAgent,
  createMemorySandboxProvider,
} from "../../src/testing.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository } from "../helpers.ts";

const brief = { text: "Fix the parser." };

test("testing kit emits events and usage and integrates real commits without a CLI", async (t) => {
  const root = await repository(t);
  const events: string[] = [];
  const agent = scriptedAgent({
    turns: [
      {
        text: "Done",
        usage: { input: 5, cached: 2, output: 3 },
        events: [{ kind: "tool", name: "edit", input: { path: "src/p.ts" } }],
        commit: {
          message: "fix: parser",
          files: {
            "src/p.ts": "export const parse = () => true;\n",
            "base.txt": null,
          },
        },
      },
    ],
  });
  const result = await dispatch({
    repository: root,
    agent,
    sandboxProvider: createMemorySandboxProvider(),
    branch: { mode: "integrate" },
    brief,
    logging: false,
    observe: (event) => events.push(event.kind),
  });
  assert.equal(result.text, "Done");
  assert.equal(result.commits.length, 1);
  assert.equal(result.commits[0]?.subject, "fix: parser");
  assert.deepEqual(result.usage, { input: 5, cached: 2, output: 3 });
  assert.ok(events.includes("tool"));
  assert.equal(
    await readFile(join(root, "src/p.ts"), "utf8"),
    "export const parse = () => true;\n",
  );
  assert.equal(await git(root, ["log", "-1", "--format=%s"]), "fix: parser\n");
});

test("testing kit exercises workflow retries, dependencies and scripted verification commands", async (t) => {
  const root = await repository(t);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createMemorySandboxProvider({
      commands: [
        { executable: "npm", arguments: ["test"], stdout: "verified\n" },
      ],
    }),
    logging: false,
  });
  const coder = defineAgentTask({
    key: "coder",
    sandbox,
    retry: { attempts: 2 },
    request: () => ({ brief, agent }),
  });
  const agent = scriptedAgent({
    turns: [
      { status: 7, stderr: "try again\n" },
      {
        text: "Fixed",
        commit: { message: "fix", files: { "base.txt": "fixed\n" } },
      },
    ],
  });
  const verify = defineCommandTask({
    key: "verify",
    after: [coder],
    sandbox,
    command: { executable: "npm", arguments: ["test"] },
  });
  const result = await defineWorkflow("offline-ci", [coder, verify]).start();
  result.unwrap();
  assert.equal(result.tasks[0]?.attempts, 2);
  assert.equal(result.tasks[1]?.status, "done");
  assert.equal(await readFile(join(root, "base.txt"), "utf8"), "fixed\n");
});

test("scripted turns are consumed once across response repairs and fail explicitly on exhaustion", async (t) => {
  const root = await repository(t);
  const agent = scriptedAgent({
    turns: [{ text: "missing tag" }, { text: "<ok>yes</ok>" }],
  });
  const result = await dispatch({
    repository: root,
    agent,
    sandboxProvider: createMemorySandboxProvider(),
    brief,
    response: defineTextResponse({ tag: "ok", repairs: 1 }),
    logging: false,
  });
  assert.equal(result.value, "yes");
  assert.equal(result.turns.length, 2);
  await assert.rejects(
    dispatch({
      repository: root,
      agent,
      sandboxProvider: createMemorySandboxProvider(),
      brief,
      logging: false,
    }),
    /turns exhausted/,
  );
});

test("memory commands refuse unscripted execution, preserve status and permit warm reuse", async (t) => {
  const root = await repository(t);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createMemorySandboxProvider({
      commands: [
        {
          executable: "probe",
          arguments: ["fail"],
          status: 9,
          stdout: "out",
          stderr: "err",
        },
        { executable: "probe", stdout: "reused" },
      ],
    }),
  });
  await assert.rejects(
    sandbox.command({ executable: "curl" }),
    /Unexpected memory sandbox command/,
  );
  const observed: string[] = [];
  assert.deepEqual(
    await sandbox.command({
      executable: "probe",
      arguments: ["fail"],
      observe: (channel, text) => observed.push(`${channel}:${text}`),
    }),
    { status: 9, stdout: "out", stderr: "err" },
  );
  assert.deepEqual(observed, ["stdout:out", "stderr:err"]);
  assert.equal(
    (await sandbox.command({ executable: "probe" })).stdout,
    "reused",
  );
});

test("scripted commits preserve separately staged host work and treat paths literally", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, "unrelated.txt"), "keep");
  await git(root, ["add", "unrelated.txt"]);
  await dispatch({
    repository: root,
    sandboxProvider: createMemorySandboxProvider(),
    agent: scriptedAgent({
      turns: [
        { commit: { message: "literal", files: { "file[1].txt": "one" } } },
      ],
    }),
    brief,
    logging: false,
  });
  assert.equal(
    await git(root, ["show", "--format=", "--name-only", "HEAD"]),
    "file[1].txt\n",
  );
  assert.match(
    await git(root, ["diff", "--cached", "--name-only"]),
    /unrelated.txt/,
  );
});

test("scripted commits reject unsafe paths at composition", () => {
  for (const path of [
    "../escape",
    "/tmp/escape",
    ".git/config",
    ".outpost/state",
    "a/../b",
    "C:/escape",
    "a\\b",
    "a//b",
    "a/./b",
  ]) {
    assert.throws(
      () =>
        scriptedAgent({
          turns: [{ commit: { message: "bad", files: { [path]: "bad" } } }],
        }),
      /Invalid scripted commit path/,
    );
  }
});

test(
  "scripted commits validate all destinations before writing and refuse symlinks",
  { skip: process.platform === "win32" },
  async (t) => {
    const root = await repository(t);
    await symlink("base.txt", join(root, "linked.txt"));
    await assert.rejects(
      dispatch({
        repository: root,
        sandboxProvider: createMemorySandboxProvider(),
        agent: scriptedAgent({
          turns: [
            {
              commit: {
                message: "bad",
                files: { "first.txt": "must not exist", "linked.txt": "bad" },
              },
            },
          ],
        }),
        brief,
        logging: false,
      }),
      /refuse symlinks/,
    );
    assert.equal(await readFile(join(root, "base.txt"), "utf8"), "base\n");
    await assert.rejects(readFile(join(root, "first.txt")), { code: "ENOENT" });
  },
);

test("memory leases honor cancellation, reject unsupported capabilities and close idempotently", async (t) => {
  const root = await repository(t);
  const provider = createMemorySandboxProvider({
    commands: [{ executable: "ok" }],
  });
  const context = {
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  };
  const aborted = AbortSignal.abort(new Error("cancelled"));
  await assert.rejects(
    provider.acquire({ ...context, signal: aborted }),
    /cancelled/,
  );
  const lease = await provider.acquire(context);
  await assert.rejects(
    lease.invoke({ executable: "ok", signal: aborted }),
    /cancelled/,
  );
  await assert.rejects(
    lease.invoke({ executable: "ok", interactive: true }),
    /do not support/,
  );
  await assert.rejects(
    lease.invoke({ executable: "ok", deadlineMs: 0 }),
    /deadline/,
  );
  await assert.rejects(lease.upload(root, root), /file transfers/);
  await assert.rejects(lease.download(root, root), /file transfers/);
  assert.equal((await lease.invoke({ executable: "ok" })).status, 0);
  await lease.release();
  await lease.release();
  await assert.rejects(lease.invoke({ executable: "ok" }), /closed/);
});

test("script construction snapshots input, validates recipes and refuses unsupported agent operations", () => {
  assert.throws(() => scriptedAgent({ turns: [] }), /at least one/);
  assert.throws(() => scriptedAgent({ turns: [{}], name: " " }), /name/);
  assert.throws(() => scriptedAgent({ turns: [{ status: -1 }] }), /status/);
  assert.throws(
    () =>
      scriptedAgent({
        turns: [{ commit: { message: " ", files: { a: "b" } } }],
      }),
    /message/,
  );
  assert.throws(
    () => scriptedAgent({ turns: [{ commit: { message: "a", files: {} } }] }),
    /require files/,
  );
  assert.throws(
    () =>
      scriptedAgent({
        turns: [
          {
            usage: { input: 1, cached: 0, output: 0 },
            events: [
              { kind: "usage", tokens: { input: 0, cached: 0, output: 0 } },
            ],
          },
        ],
      }),
    /either/,
  );
  const turns = [{ text: "original" }];
  const agent = scriptedAgent({ turns });
  turns[0]!.text = "changed";
  assert.equal(agent.harness.bind(), agent);
  assert.throws(() => agent.request({ interactive: true }), /do not support/);
  assert.throws(
    () => agent.request({ continuation: { id: "id" } }),
    /Unknown scripted conversation/,
  );
  assert.throws(() => agent.events("unexpected"), /Unexpected/);
  const command = agent.request({});
  assert.match(command.arguments![0]!, /original/);
  assert.throws(
    () => agent.request({}),
    (error) => error instanceof OutpostError && error.code === "process",
  );
});

test("memory command retention keeps observer output and cancellation still permits reuse", async (t) => {
  const root = await repository(t);
  const lease = await createMemorySandboxProvider({
    commands: [
      { executable: "cancel", stdout: "output" },
      { executable: "reuse", stdout: "abcdef", stderr: "123456" },
    ],
  }).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const controller = new AbortController();
  await assert.rejects(
    lease.invoke({
      executable: "cancel",
      signal: controller.signal,
      observe: () => controller.abort(new Error("stop")),
    }),
    /stop/,
  );
  const seen: string[] = [];
  const result = await lease.invoke({
    executable: "reuse",
    retain: 3,
    observe: (_, text) => seen.push(text),
  });
  assert.deepEqual(seen, ["abcdef", "123456"]);
  assert.deepEqual(result, { status: 0, stdout: "def", stderr: "456" });
});

test("memory deadlines stop a scripted commit and release settles active work", async (t) => {
  const root = await repository(t);
  const lease = await createMemorySandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const files = Object.fromEntries(
    Array.from({ length: 200 }, (_, index) => [
      `files/${index}.txt`,
      "content",
    ]),
  );
  const agent = scriptedAgent({
    turns: [{ commit: { message: "too slow", files } }],
  });
  await assert.rejects(
    lease.invoke({ ...agent.request({}), deadlineMs: 1 }),
    (error) => error instanceof OutpostError && error.code === "timeout",
  );
  const finishing = lease.invoke(
    scriptedAgent({
      turns: [{ commit: { message: "cancel on release", files } }],
    }).request({}),
  );
  const rejected = assert.rejects(finishing, /disposed/);
  await lease.release();
  await rejected;
});

test("scripted conversations resume only within the same open sandbox", async (t) => {
  const root = await repository(t);
  const agent = scriptedAgent({
    turns: [{ text: "first" }, { text: "second" }],
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createMemorySandboxProvider(),
    logging: false,
  });
  const first = await sandbox.dispatch({ agent, brief });
  const next = await first.resume({ brief });
  assert.equal(next.text, "second");
  assert.equal(next.conversation, first.conversation);
  const cold = await dispatch({
    repository: await repository(t),
    sandboxProvider: createMemorySandboxProvider(),
    agent: scriptedAgent({
      turns: [{ text: "done" }, { text: "unreachable" }],
    }),
    brief,
    logging: false,
  });
  await assert.rejects(
    cold.resume({ brief }),
    /does not support native conversations/,
  );
});

test("memory script boundaries reject malformed recipes before executing", async (t) => {
  const root = await repository(t);
  const lease = await createMemorySandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const command = scriptedAgent({ turns: [{}] }).request({});
  const valid = { events: [], status: 0, stderr: "" };
  for (const recipe of [
    null,
    {},
    { ...valid, events: [42] },
    { ...valid, status: 256 },
    { ...valid, stderr: null },
    { ...valid, commit: { message: "bad", files: { a: 42 } } },
  ]) {
    await assert.rejects(
      lease.invoke({ ...command, arguments: [JSON.stringify(recipe)] }),
      /Invalid scripted/,
    );
  }
  await assert.rejects(
    lease.invoke({ ...command, arguments: [] }),
    /Invalid scripted command/,
  );
  await assert.rejects(
    lease.invoke({ ...command, directory: join(root, "outside") }),
    /sandbox workspace/,
  );
  assert.throws(
    () => createMemorySandboxProvider({ commands: [{ executable: "" }] }),
    /executable/,
  );
  assert.throws(
    () =>
      createMemorySandboxProvider({
        commands: [{ executable: "a", status: -1 }],
      }),
    /status/,
  );
  assert.throws(
    () =>
      scriptedAgent({
        turns: [{ events: [{ kind: "conversation", id: "other" }] }],
      }),
    /own their/,
  );
});
