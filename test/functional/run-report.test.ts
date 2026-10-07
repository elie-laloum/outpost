import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  dispatch,
  createSandbox,
  createAgent,
  createHarness,
  createHarnessShellTools,
  createObservationHub,
} from "../../src/index.ts";
import type {
  RunReport,
  ModelResult,
  ModelPriceTable,
  DispatchResult,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { repository, scripted, emit } from "../helpers.ts";

const sandboxProvider = createLocalSandboxProvider();
const parse = (result: Pick<DispatchResult<unknown>, "report">): RunReport =>
  JSON.parse(result.report({ format: "json" }));
const change = `import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';writeFileSync('base.txt','changed\\n');execFileSync('git',['add','base.txt']);execFileSync('git',['commit','-m','Change']);`;

test("cold report survives integration, cleanup and later repository edits", async (t) => {
  const root = await repository(t);
  const baseline = (await git(root, ["rev-parse", "HEAD"])).trim();
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    agent: scripted(change + emit("Changed the base. <outpost>done</outpost>")),
    branch: { mode: "integrate" },
    brief: { text: "change" },
    logging: false,
  });
  await assert.rejects(readFile(join(result.directory, "base.txt")), {
    code: "ENOENT",
  });
  const report = parse(result);
  assert.equal(report.version, 1);
  assert.equal(report.completed, true);
  assert.equal(report.text, result.text);
  assert.deepEqual(report.commits, result.commits);
  assert.equal(report.diff?.baseline, baseline);
  assert.equal(report.diff?.head, result.commits[0]?.oid);
  assert.deepEqual(report.diff?.files, [
    { paths: ["base.txt"], added: 1, removed: 1, binary: false },
  ]);
  assert.equal(report.diff?.filesChanged, 1);
  assert.equal(report.cost, null);
  assert.ok(report.durationMs >= result.turns[0]!.durationMs);
  const markdown = result.report();
  assert.equal(markdown, result.report({ format: "markdown" }));
  assert.match(markdown, /1 file · \+1 \/ −1 lines/);
  assert.match(markdown, /Completion condition: satisfied/);
  await writeFile(join(root, "base.txt"), "later\n");
  assert.equal(result.report(), markdown);
  result.commits.length &&
    Object.assign(result.commits[0]!, { subject: "mutated" });
  assert.deepEqual(parse(result), report);
});

test("warm reports measure only their own net committed changes and exclude dirty files", async (t) => {
  const root = await repository(t);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider,
    logging: false,
  });
  const first = await sandbox.dispatch({
    agent: scripted(change + emit("<outpost>done</outpost>")),
    brief: { text: "change" },
  });
  const second = await sandbox.dispatch({
    agent: scripted(
      `import {writeFileSync} from 'node:fs';writeFileSync('base.txt','dirty');writeFileSync('untracked.txt','dirty');` +
        emit("unfinished"),
    ),
    brief: { text: "dirty" },
  });
  assert.equal(parse(first).diff?.filesChanged, 1);
  assert.equal(parse(second).diff?.filesChanged, 0);
  assert.equal(parse(second).diff?.baseline, parse(first).diff?.head);
  assert.equal(parse(second).completed, false);
  const snapshot = first.report();
  await sandbox.close({ preserve: true });
  assert.equal(first.report(), snapshot);
});

test("multiple cold passes report a net diff instead of adding each pass's line counts", async (t) => {
  const root = await repository(t);
  const agent = scripted(
    `import {readFileSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';const first=readFileSync('base.txt','utf8')==='base\\n';writeFileSync('base.txt',first?'changed\\n':'base\\n');execFileSync('git',['add','base.txt']);execFileSync('git',['commit','-m','Pass']);console.log(JSON.stringify({kind:'usage',tokens:{input:3,cached:1,output:2}}));` +
      emit("unfinished"),
  );
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    agent,
    brief: { text: "two passes" },
    passes: 2,
    logging: false,
  });
  const report = parse(result);
  assert.equal(result.turns.length, 2);
  assert.equal(report.commits.length, 2);
  assert.equal(report.diff?.filesChanged, 0);
  assert.equal(report.usage.input, 6);
  assert.equal(report.usage.output, 4);
  assert.equal(report.text, result.text);
});

test("Git reports rename paths, deletions and binaries without counting binary lines", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, "image.bin"), Buffer.from([0, 1, 2]));
  await writeFile(join(root, "removed.txt"), "remove\n");
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Fixtures"]);
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    brief: { text: "rename" },
    logging: false,
    agent: scripted(
      `import {writeFileSync,renameSync,unlinkSync} from 'node:fs';import {execFileSync} from 'node:child_process';renameSync('base.txt','renamed \`file.txt');unlinkSync('removed.txt');writeFileSync('image.bin',Buffer.from([0,9,3]));execFileSync('git',['add','.']);execFileSync('git',['commit','-m','Rename']);` +
        emit("<outpost>done</outpost>"),
    ),
  });
  const report = parse(result);
  assert.equal(report.diff?.filesChanged, 3);
  assert.equal(report.diff?.binaryFiles, 1);
  assert.equal(report.diff?.added, 0);
  assert.equal(report.diff?.removed, 1);
  assert.ok(report.diff?.files.some((file) => file.paths.length === 2));
  assert.match(result.report(), /renamed `file\.txt/);
});

test("reports correlate real failed shell calls, respect redaction and price cumulative usage", async (t) => {
  const root = await repository(t);
  let step = 0;
  const prices: ModelPriceTable = {
    currency: "EUR",
    models: { demo: { input: 1, cached: 0.5, output: 2 } },
  };
  const agent = createAgent({
    model: "demo",
    harness: createHarness({
      tools: [createHarnessShellTools()],
      modelProvider: {
        name: "offline",
        async request(): Promise<ModelResult> {
          step++;
          const usage = { input: 10, cached: 2, output: 3 };
          if (step === 1)
            return {
              text: "",
              usage,
              content: [
                {
                  type: "tool-call",
                  id: "shell-1",
                  name: "shell",
                  input: { command: "printf 'dummy-secret\\n'; exit 7" },
                },
              ],
            };
          return {
            usage,
            text: "Investigated dummy-secret. <outpost>done</outpost>",
          };
        },
      },
    }),
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    agent,
    brief: { text: "test" },
    prices,
    redact: [/dummy-secret/g],
    logging: false,
  });
  const report = parse(result);
  assert.equal(report.failedTools.length, 1);
  assert.equal(report.failedTools[0]?.tool, "shell");
  assert.match(report.failedTools[0]!.command!, /exit 7/);
  assert.match(report.failedTools[0]!.preview, /status.*7/i);
  assert.ok(!result.report().includes("dummy-secret"));
  assert.ok(!result.report({ format: "json" }).includes("dummy-secret"));
  assert.equal(report.usage.input, 20);
  assert.deepEqual(report.cost, {
    currency: "EUR",
    amount: 0.00003,
    complete: true,
  });
  assert.equal(report.omittedFailures, 0);
});

test("failure correlation isolates reused call IDs across passes and subagents", async (t) => {
  const root = await repository(t);
  const events = [
    { kind: "tool", name: "shell", input: { command: "main" }, callId: "same" },
    {
      kind: "tool",
      name: "shell",
      input: { cmd: "child" },
      callId: "same",
      subagentId: "child",
    },
    {
      kind: "tool-result",
      name: "shell",
      callId: "same",
      isError: true,
      preview: "child failure",
      characters: 13,
      subagentId: "child",
    },
    {
      kind: "tool-result",
      name: "shell",
      callId: "same",
      isError: true,
      preview: "main failure",
      characters: 12,
    },
  ];
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    brief: { text: "events" },
    passes: 2,
    logging: false,
    agent: scripted(
      events
        .map(
          (event) => `console.log(${JSON.stringify(JSON.stringify(event))});`,
        )
        .join("") + emit("unfinished"),
    ),
  });
  assert.deepEqual(
    parse(result).failedTools.map(({ command, pass, subagentId }) => ({
      command,
      pass,
      subagentId,
    })),
    [
      { command: "child", pass: 1, subagentId: "child" },
      { command: "main", pass: 1, subagentId: null },
      { command: "child", pass: 2, subagentId: "child" },
      { command: "main", pass: 2, subagentId: null },
    ],
  );
});

test("journal or user observer failure does not remove the report", async (t) => {
  const root = await repository(t);
  const observation = createObservationHub({
    sinks: [
      {
        observe() {
          throw new Error("sink broken");
        },
      },
    ],
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    observation,
    agent: scripted(emit("<outpost>done</outpost>")),
    brief: { text: "test" },
    logging: {
      transporter: {
        name: "broken",
        async read() {
          throw new Error("read");
        },
        async write() {
          throw new Error("write");
        },
        async *list() {
          throw new Error("list");
        },
        async remove() {
          throw new Error("delete");
        },
      },
    },
  });
  assert.equal(parse(result).completed, true);
  assert.ok(result.observerErrors!.length > 0);
  await observation.close();
  await rm(join(root, ".outpost", "storage"), { recursive: true, force: true });
  assert.equal(parse(result).diff?.filesChanged, 0);
});
