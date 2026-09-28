import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  agent,
  defineHarnessTool,
  dispatch,
  harness,
  readJournal,
  replayAgent,
  ReplayDivergence,
  response,
} from "../../src/index.ts";
import type {
  AgentObservation,
  DispatchResult,
  ModelProvider,
} from "../../src/index.ts";
import { recoveryDetails } from "../../src/domain/errors.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repositoryTransport } from "../../src/infrastructure/repository-transport.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const committing = `import {writeFileSync, rmSync} from 'node:fs'; import {execFileSync} from 'node:child_process';
console.error('working');
writeFileSync('notes.txt','caf\\u00e9\\n'); writeFileSync('image.bin', Buffer.from([0,255,1,254]));
execFileSync('git',['add','.']); execFileSync('git',['commit','--cleanup=verbatim','-m','Add files\\n\\nBody  \\n']);
rmSync('base.txt'); execFileSync('git',['add','-A']); execFileSync('git',['commit','-m','Remove base']);
console.log(JSON.stringify({kind:'usage',tokens:{input:5,cached:1,output:2}}));
console.log(JSON.stringify({kind:'tool',name:'edit',input:{path:'notes.txt'},callId:'c1'}));
${emit("Finished <outpost>done</outpost>")}`;

const adding = `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process';
writeFileSync('notes.txt','notes\\n'); execFileSync('git',['add','.']); execFileSync('git',['commit','-m','Add notes']);
${emit("<outpost>done</outpost>")}`;

function observed(events: AgentObservation[]) {
  return (event: AgentObservation) => events.push(event);
}

function comparable(events: readonly AgentObservation[]) {
  return events
    .filter((event) => event.kind !== "phase")
    .map(({ at: _at, seq: _seq, scope: _scope, ...event }) =>
      event.kind === "summary" ? { ...event, durationMs: 0 } : event,
    );
}

async function head(root: string): Promise<string> {
  return (await git(root, ["rev-parse", "HEAD"])).trim();
}

async function rewind(root: string, baseline: string): Promise<void> {
  await git(root, ["reset", "--hard", baseline]);
}

async function record(
  root: string,
  script: string,
  settings: { readonly verbose?: boolean; readonly replayable?: boolean } = {},
) {
  const events: AgentObservation[] = [];
  const baseline = await head(root);
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(script),
    brief: { text: "work" },
    logging: {
      replayable: settings.replayable ?? true,
      verbose: settings.verbose ?? false,
    },
    observe: observed(events),
  });
  return { result, events, baseline, journal: await journal(root, result) };
}

async function journal(
  root: string,
  result: Pick<DispatchResult<unknown>, "logReference">,
) {
  assert.ok(result.logReference);
  return readJournal({
    transporter: repositoryTransport(root),
    reference: result.logReference,
  });
}

test("replay reproduces a CLI run's events, result and exact commits", async (t) => {
  const root = await repository(t);
  const recorded = await record(root, committing, { verbose: true });
  const replaying = replayAgent({ journal: recorded.journal });
  assert.equal(replaying.turns.length, 1);
  assert.equal(replaying.remainingTurns, 1);
  await rewind(root, recorded.baseline);
  const events: AgentObservation[] = [];
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: replaying,
    brief: { text: "work" },
    logging: { replayable: true },
    observe: observed(events),
  });
  assert.equal(replaying.remainingTurns, 0);
  assert.deepEqual(comparable(events), comparable(recorded.events));
  assert.ok(events.some((event) => event.kind === "raw"));
  assert.deepEqual(replayed.commits, recorded.result.commits);
  assert.equal(replayed.text, recorded.result.text);
  assert.deepEqual(replayed.usage, recorded.result.usage);
  assert.equal(replayed.completed, true);
  assert.equal(
    await readFile(join(replayed.directory, "notes.txt"), "utf8"),
    "café\n",
  );
  assert.deepEqual(
    [...(await readFile(join(replayed.directory, "image.bin")))],
    [0, 255, 1, 254],
  );
  const again = (await journal(root, replayed)).find(
    (entry) => (entry as { kind: string }).kind === "workspace-commits",
  ) as { commits: readonly { oid: string }[] };
  assert.deepEqual(
    again.commits.map((commit) => commit.oid),
    recorded.result.commits.map((commit) => commit.oid).reverse(),
  );
});

test("replay rebuilds equivalent commits from a repository with the same tree", async (t) => {
  const recorded = await record(await repository(t), committing);
  const fresh = await repository(t);
  const replayed = await dispatch({
    repository: fresh,
    sandboxProvider: localSandboxProvider(),
    agent: replayAgent({ journal: recorded.journal }),
    brief: { text: "work" },
  });
  assert.deepEqual(
    replayed.commits.map((commit) => commit.subject),
    recorded.result.commits.map((commit) => commit.subject),
  );
  for (const [index, commit] of replayed.commits.entries())
    assert.equal(
      (await git(fresh, ["rev-parse", `${commit.oid}^{tree}`])).trim(),
      (
        await git(recorded.result.directory, [
          "rev-parse",
          `${recorded.result.commits[index]!.oid}^{tree}`,
        ])
      ).trim(),
    );
});

test("replay reports prompt, baseline, tree, exhausted and unrecorded divergences", async (t) => {
  const root = await repository(t);
  const recorded = await record(root, adding);
  const run = (
    repositoryPath: string,
    selected: ReturnType<typeof replayAgent>,
    text = "work",
    warnings: string[] = [],
  ) =>
    (repositoryPath === root
      ? rewind(root, recorded.baseline)
      : Promise.resolve()
    ).then(() =>
      dispatch({
        repository: repositoryPath,
        sandboxProvider: localSandboxProvider(),
        agent: selected,
        brief: { text },
        warn: (message) => warnings.push(message),
      }),
    );

  const prompt = await run(
    root,
    replayAgent({ journal: recorded.journal }),
    "other",
  ).catch((error: unknown) => error);
  assert.ok(prompt instanceof ReplayDivergence);
  assert.equal(prompt.code, "replay");
  assert.equal(prompt.kind, "prompt");
  assert.equal(prompt.turn, 1);
  assert.equal(prompt.expected, "work");
  assert.equal(prompt.actual, "other");

  const warned: string[] = [];
  const tolerated = await run(
    root,
    replayAgent({ journal: recorded.journal, divergence: "warn" }),
    "other",
    warned,
  );
  assert.equal(tolerated.commits[0]?.oid, recorded.result.commits[0]?.oid);
  assert.ok(warned.some((message) => /prompt that differs/.test(message)));

  const shifted = await repository(t);
  await writeFile(join(shifted, "extra.txt"), "extra\n");
  await git(shifted, ["add", "."]);
  await git(shifted, ["commit", "-m", "Extra"]);
  await assert.rejects(
    run(shifted, replayAgent({ journal: recorded.journal })),
    (error: unknown) =>
      error instanceof ReplayDivergence && error.kind === "baseline",
  );
  const shiftedWarnings: string[] = [];
  const shiftedRun = await run(
    shifted,
    replayAgent({ journal: recorded.journal, divergence: "warn" }),
    "work",
    shiftedWarnings,
  );
  assert.deepEqual(
    shiftedRun.commits.map((commit) => commit.subject),
    ["Add notes"],
  );
  assert.ok(shiftedWarnings.some((message) => /workspace tree/.test(message)));
  assert.ok(
    shiftedWarnings.some((message) => /Add notes|commit/.test(message)),
  );

  const conflicting = await repository(t);
  await writeFile(join(conflicting, "notes.txt"), "different\n");
  await git(conflicting, ["add", "."]);
  await git(conflicting, ["commit", "-m", "Conflicting notes"]);
  const conflict = await run(
    conflicting,
    replayAgent({ journal: recorded.journal, divergence: "warn" }),
  ).catch((error: unknown) => error);
  assert.ok(conflict instanceof ReplayDivergence);
  assert.equal(conflict.kind, "tree");
  assert.equal(conflict.commit, recorded.result.commits[0]?.oid);

  const single = replayAgent({ journal: recorded.journal });
  await run(root, single);
  await assert.rejects(
    run(root, single),
    (error: unknown) =>
      error instanceof ReplayDivergence &&
      error.kind === "exhausted" &&
      error.turn === 2,
  );

  await rewind(root, recorded.baseline);
  const unreplayable = await record(root, adding, { replayable: false });
  await assert.rejects(
    run(root, replayAgent({ journal: unreplayable.journal })),
    (error: unknown) =>
      error instanceof ReplayDivergence &&
      error.kind === "unrecorded" &&
      /logging\.replayable/.test(error.message),
  );
  const eventsOnly: string[] = [];
  const partial = await run(
    root,
    replayAgent({ journal: unreplayable.journal, divergence: "warn" }),
    "work",
    eventsOnly,
  );
  assert.deepEqual(partial.commits, []);
  assert.equal(partial.completed, true);
  assert.ok(
    eventsOnly.some((message) => /no recorded workspace/.test(message)),
  );
});

test("replay rethrows a recorded failure after reproducing its commits", async (t) => {
  const root = await repository(t);
  const baseline = await head(root);
  const failure = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; writeFileSync('partial.txt','x'); execFileSync('git',['add','.']); execFileSync('git',['commit','-m','Partial']); console.log(JSON.stringify({kind:'text',text:'partial'})); process.exit(3);`,
    ),
    brief: { text: "work" },
    logging: { replayable: true },
  }).catch((error: unknown) => error);
  const reference = recoveryDetails(failure)?.logReference;
  assert.ok(reference);
  const recorded = await readJournal({
    transporter: repositoryTransport(root),
    reference: reference as never,
  });
  await rewind(root, baseline);
  const events: AgentObservation[] = [];
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: replayAgent({ journal: recorded }),
    brief: { text: "work" },
    observe: observed(events),
  }).catch((error: unknown) => error);
  assert.ok(replayed instanceof Error);
  assert.equal((replayed as { code?: string }).code, "process");
  assert.equal(replayed.message, "Agent exited with status 3");
  assert.deepEqual(
    recoveryDetails(replayed)?.commits,
    recoveryDetails(failure)?.commits,
  );
  assert.ok(events.some((event) => event.kind === "text"));
});

test("replay follows recorded response repairs and multiple passes", async (t) => {
  const root = await repository(t);
  const repairing = scripted((input) =>
    input.continuation
      ? `console.log(JSON.stringify({kind:'conversation',id:'c1'})); console.log(JSON.stringify({kind:'text',text:'<result>{"ok":true}</result>'}))`
      : `console.log(JSON.stringify({kind:'conversation',id:'c1'})); console.log(JSON.stringify({kind:'text',text:'<result>oops</result>'}))`,
  );
  const spec = response.json({
    tag: "result",
    schema: (value) => value as { ok: boolean },
    repairs: 1,
  });
  const brief = { text: "Answer inside <result> tags." };
  const original = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: repairing,
    brief,
    response: spec,
    logging: { replayable: true },
  });
  const repairs = replayAgent({ journal: await journal(root, original) });
  const baseline = await head(root);
  assert.equal(repairs.turns.length, 2);
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: repairs,
    brief,
    response: spec,
  });
  assert.deepEqual(replayed.value, { ok: true });
  assert.equal(repairs.remainingTurns, 0);
  await assert.rejects(
    replayed.resume({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      brief: { text: "again" },
    }),
    /does not support native conversations/,
  );

  const counting = `import {existsSync, writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process';
const file = existsSync('one.txt') ? 'two.txt' : 'one.txt'; writeFileSync(file, file);
execFileSync('git',['add','.']); execFileSync('git',['commit','-m',file]);
${emit("pass")}`;
  await rewind(root, baseline);
  const passes = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(counting),
    brief: { text: "work" },
    passes: 2,
    logging: { replayable: true },
  });
  const multiple = replayAgent({ journal: await journal(root, passes) });
  assert.equal(multiple.turns.length, 2);
  await rewind(root, baseline);
  const replayedPasses = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: multiple,
    brief: { text: "work" },
    passes: 2,
  });
  assert.deepEqual(replayedPasses.commits, passes.commits);
  assert.equal(replayedPasses.text, passes.text);
});

test("replay preserves harness observation sources and honors cancellation", async (t) => {
  const root = await repository(t);
  let step = 0;
  const modelProvider: ModelProvider = {
    name: "fixture",
    async request() {
      if (step++ === 0)
        return {
          text: "",
          stopReason: "tool-calls",
          usage: { input: 3, cached: 0, output: 1 },
          content: [
            { type: "tool-call", id: "call", name: "commit", input: {} },
          ],
        };
      return {
        text: "<outpost>done</outpost>",
        stopReason: "end",
        usage: { input: 4, cached: 0, output: 2 },
      };
    },
  };
  const commit = defineHarnessTool({
    name: "commit",
    description: "Commit a fixture file",
    input: { type: "object" },
    async execute(_input, context) {
      await writeFile(join(context.sandbox.root, "harness.txt"), "harness\n");
      for (const args of [
        ["add", "."],
        ["commit", "-m", "Harness change"],
      ])
        await context.sandbox.invoke({ executable: "git", arguments: args });
      return "committed";
    },
  });
  const selected = agent({
    model: "fixture",
    harness: harness({ modelProvider, tools: [commit], conversations: false }),
  });
  const events: AgentObservation[] = [];
  const baseline = await head(root);
  const original = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: selected,
    brief: { text: "work" },
    logging: { replayable: true, verbose: true },
    observe: observed(events),
  });
  const recorded = await journal(root, original);
  const replaying = replayAgent({ journal: recorded });
  assert.equal(replaying.source, "harness");
  await rewind(root, baseline);
  const replayedEvents: AgentObservation[] = [];
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: replaying,
    brief: { text: "work" },
    observe: observed(replayedEvents),
  });
  assert.equal(step, 2);
  assert.deepEqual(replayed.commits, original.commits);
  assert.deepEqual(replayed.usage, original.usage);
  assert.deepEqual(comparable(replayedEvents), comparable(events));
  assert.ok(replayedEvents.every((event) => event.source === "harness"));

  await rewind(root, baseline);
  const controller = new AbortController();
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: replayAgent({ journal: recorded }),
      brief: { text: "work" },
      signal: controller.signal,
      observe(event) {
        if (event.kind === "tool") controller.abort();
      },
    }),
    (error: unknown) => controller.signal.aborted && error instanceof Error,
  );
});
