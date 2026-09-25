import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  createSandbox,
  attach,
  dispatch,
  openWorkspace,
  response,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository, scripted, emit } from "../helpers.ts";

test("terminal attachment integrates successful commits and preserves failed work", async (t) => {
  const root = await repository(t);
  const success = scripted((input) => {
    assert.equal(input.interactive, true);
    assert.equal(input.text, "terminal objective");
    return "import fs from 'node:fs'; import {execFileSync} from 'node:child_process'; fs.writeFileSync('terminal.txt','saved');execFileSync('git',['add','terminal.txt']);execFileSync('git',['commit','-m','Terminal change']);";
  });
  const result = await attach({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: success,
    branch: { mode: "integrate" },
    brief: { text: "terminal objective" },
  });
  assert.equal(result.status, 0);
  assert.equal(result.commits[0]?.subject, "Terminal change");
  assert.equal(await readFile(join(root, "terminal.txt"), "utf8"), "saved");
  const failed = await attach({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      "import fs from 'node:fs';fs.writeFileSync('unfinished.txt','kept');process.exit(7)",
    ),
    branch: { mode: "named", name: "terminal-recovery" },
  });
  assert.equal(failed.status, 7);
  assert.equal(failed.retainedDirectory, failed.directory);
  assert.equal(
    await readFile(join(failed.directory, "unfinished.txt"), "utf8"),
    "kept",
  );
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
  });
  assert.equal(
    (await box.attach({ agent: scripted("process.exit(0)") })).status,
    0,
  );
});

test("a warm sandbox switches agents and does not leak adapter variables between runs", async (t) => {
  const root = await repository(t);
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  const first = {
    ...scripted(
      "console.log(JSON.stringify({kind:'text',text:process.env.AGENT_ONLY??'absent'}))",
    ),
    variables: { AGENT_ONLY: "first" },
  };
  const second = scripted(
    "console.log(JSON.stringify({kind:'text',text:process.env.AGENT_ONLY??'absent'}))",
  );
  assert.equal(
    (await box.dispatch({ agent: first, brief: { text: "test" } })).text,
    "first",
  );
  assert.equal(
    (await box.dispatch({ agent: second, brief: { text: "test" } })).text,
    "absent",
  );
  await assert.rejects(
    box.dispatch({ brief: { text: "missing adapter" } }),
    /Provide an agent/,
  );
});

test("one-shot dispatch writes a journal, returns usage and integrates committed changes", async (t) => {
  const root = await repository(t);
  const agent = scripted(
    `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; writeFileSync('created.txt','hello'); execFileSync('git',['add','created.txt']); execFileSync('git',['commit','-m','Created']); console.log(JSON.stringify({kind:'usage',tokens:{input:2,cached:1,output:3}})); ${emit("<outpost>done</outpost>")}`,
  );
  const output = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    branch: { mode: "integrate" },
    brief: { text: "work" },
  });
  assert.equal(await readFile(join(root, "created.txt"), "utf8"), "hello");
  assert.equal(output.commits[0]?.subject, "Created");
  assert.deepEqual(output.usage, { input: 2, cached: 1, output: 3 });
  assert.equal(output.completed, true);
  assert.ok(output.log);
  assert.match(await readFile(output.log, "utf8"), /usage/);
  await assert.rejects(access(output.directory));
});

test("independent workspaces survive sandbox closure and retain dirty files", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "feature" },
  });
  const box = await createSandbox({
    workspace,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(emit("ready")),
    logging: false,
  });
  await assert.rejects(workspace.close(), /sandbox/);
  await box.command({
    executable: process.execPath,
    arguments: ["-e", "require('fs').writeFileSync('dirty.txt','saved')"],
  });
  await box.close();
  await access(workspace.directory);
  const closed = await workspace.close();
  assert.equal(closed.retainedDirectory, workspace.directory);
  assert.deepEqual(await workspace.close(), closed);
  const reused = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "feature" },
  });
  assert.equal(
    await readFile(join(reused.directory, "dirty.txt"), "utf8"),
    "saved",
  );
  await reused.close();
});

test("warm sandbox rejects overlap and remains usable after cancellation", async (t) => {
  const root = await repository(t);
  const box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted("setInterval(()=>{},1000)"),
    logging: false,
  });
  t.after(() => box.close());
  const stop = new AbortController();
  const running = box.dispatch({
    brief: { text: "wait" },
    signal: stop.signal,
  });
  assert.throws(
    () => box.command({ executable: process.execPath }),
    /active operation/,
  );
  setTimeout(() => stop.abort(), 80);
  await assert.rejects(running, (error) => error === stop.signal.reason);
  assert.equal(
    (
      await box.command({
        executable: process.execPath,
        arguments: ["-e", "console.log('alive')"],
      })
    ).stdout.trim(),
    "alive",
  );
});

test("file briefs reload between passes and literal briefs never expand", async (t) => {
  const root = await repository(t);
  const path = join(root, "prompt.md");
  await writeFile(path, "first");
  const agent = scripted(
    `let text=''; for await(const x of process.stdin) text+=x; console.log(JSON.stringify({kind:'text',text}));`,
  );
  const box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    logging: false,
  });
  t.after(() => box.close());
  let seen = 0;
  const output = await box.dispatch({
    brief: { file: path },
    passes: 2,
    observe(event) {
      if (event.kind === "text" && ++seen === 1) writeFileSync(path, "second");
    },
  });
  assert.equal(output.turns.length, 2);
  assert.equal(output.turns[1]?.text, "second");
  const literal = "{{MISSING}} !`never execute`";
  assert.equal(
    (await box.dispatch({ brief: { text: literal } })).text,
    literal,
  );
});

test("schema repairs resume the same conversation and observer failures are harmless", async (t) => {
  const root = await repository(t);
  const prompts: string[] = [];
  const agent = scripted((input) => {
    prompts.push(input.text ?? "");
    return `console.log(JSON.stringify({kind:'conversation',id:'fixture-id'})); ${emit(input.continuation ? '<answer>{"ok":true}</answer>' : "bad")}`;
  });
  const box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    logging: false,
  });
  t.after(() => box.close());
  const output = await box.dispatch({
    brief: { text: "Return <answer> JSON" },
    response: response.json({
      tag: "answer",
      repairs: 1,
      schema: (input) => input as { ok: boolean },
    }),
    observe() {
      throw new Error("observer");
    },
  });
  assert.deepEqual(output.value, { ok: true });
  assert.equal(output.turns.length, 2);
  assert.match(prompts[1]!, /Validation failure:/);
  assert.match(prompts[1]!, /Previous content:/);
  assert.match(prompts[1]!, /Cause:/);
  assert.match(prompts[1]!, /Further repair attempts after this one: 0/);
  assert.match(
    prompts[1]!,
    /Do not edit files, run commands or continue implementation/,
  );
  assert.equal(
    (await output.resume({ brief: { text: "continue" } })).conversation,
    "fixture-id",
  );
});

test("workspace locks and checked-out branch errors are actionable", async (t) => {
  const root = await repository(t);
  const a = await openWorkspace({ repository: root });
  await assert.rejects(openWorkspace({ repository: root }), /already in use/);
  await a.close();
  await assert.rejects(
    openWorkspace({
      repository: root,
      branch: { mode: "named", name: "main" },
    }),
    /elsewhere/,
  );
  await git(root, ["checkout", "--detach"]);
  await assert.rejects(
    openWorkspace({ repository: root, branch: { mode: "integrate" } }),
    /attached/,
  );
});
