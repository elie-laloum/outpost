import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dispatch, readJournal } from "../../src/index.ts";
import type { WorkspaceCommitsEvent } from "../../src/domain/replay.types.ts";
import { createObservationHub } from "../../src/domain/observation.ts";
import type { Observation } from "../../src/domain/observation.types.ts";
import { recordReplayChanges } from "../../src/application/replay-recording.ts";
import { git } from "../../src/infrastructure/git.ts";
import { recordWorkspaceCommits } from "../../src/infrastructure/git/replay-commits.ts";
import { repositoryTransport } from "../../src/infrastructure/repository-transport.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const committing = `import {writeFileSync, rmSync, chmodSync} from 'node:fs'; import {execFileSync} from 'node:child_process';
writeFileSync('notes.txt','caf\\u00e9\\r\\nsecond\\n'); writeFileSync('image.bin', Buffer.from([0,255,1,254,0,128]));
execFileSync('git',['add','.']); execFileSync('git',['commit','--cleanup=verbatim','-m','Add files\\n\\nBody line  \\n']);
rmSync('base.txt'); writeFileSync('script.sh','#!/bin/sh\\n'); chmodSync('script.sh', 0o755);
execFileSync('git',['add','-A']); execFileSync('git',['update-index','--chmod=+x','script.sh']); execFileSync('git',['commit','-m','Rework']);
${emit("<outpost>done</outpost>")}`;

async function recorded(root: string, reference: unknown) {
  const events = (await readJournal({
    transporter: repositoryTransport(root),
    reference: reference as never,
  })) as readonly { kind: string }[];
  return events;
}

test("replayable journals record linear commits with reproducible patches", async (t) => {
  const root = await repository(t);
  const baseline = (await git(root, ["rev-parse", "HEAD"])).trim();
  const output = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(committing),
    brief: { text: "work" },
    logging: { replayable: true },
  });
  const events = await recorded(root, output.logReference);
  const changes = events.filter(
    (event) => event.kind === "workspace-commits",
  ) as WorkspaceCommitsEvent[];
  assert.equal(changes.length, 1);
  const change = changes[0]!;
  assert.ok("commits" in change);
  assert.equal(change.baseline.commit, baseline);
  assert.deepEqual(
    change.commits.map((commit) => commit.oid),
    output.commits.map((commit) => commit.oid).reverse(),
  );
  assert.equal(change.commits[0]!.message, "Add files\n\nBody line  \n");
  assert.equal(change.commits[0]!.author.email, "agent@example.test");
  assert.match(change.commits[0]!.author.date, /^\d+ [+-]\d{4}$/);
  assert.match(change.commits[0]!.patch, /GIT binary patch/);
  assert.match(change.commits[1]!.patch, /new file mode 100755/);
  assert.ok(
    events.findIndex((event) => event.kind === "workspace-commits") <
      events.findIndex((event) => event.kind === "dispatch-finished"),
  );
});

test("journals omit workspace commits unless replay recording is requested", async (t) => {
  const root = await repository(t);
  const output = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(committing),
    brief: { text: "work" },
    logging: {},
  });
  const events = await recorded(root, output.logReference);
  assert.equal(
    events.some((event) => event.kind === "workspace-commits"),
    false,
  );
});

test("failed dispatches record their error and workspace commits", async (t) => {
  const root = await repository(t);
  const agent = scripted(
    `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; writeFileSync('partial.txt','x'); execFileSync('git',['add','.']); execFileSync('git',['commit','-m','Partial']); process.exit(3);`,
  );
  const failure = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    brief: { text: "work" },
    logging: { replayable: true },
  }).catch((error: unknown) => error);
  const reference = (failure as { recovery?: { logReference?: unknown } })
    .recovery?.logReference;
  assert.ok(reference);
  const events = (await recorded(root, reference)) as readonly {
    kind: string;
    error?: unknown;
    commits?: readonly { message: string }[];
  }[];
  const finished = events.find((event) => event.kind === "dispatch-finished");
  assert.deepEqual(finished?.error, {
    code: "process",
    message: "Agent exited with status 3",
  });
  const change = events.find((event) => event.kind === "workspace-commits");
  assert.equal(change?.commits?.[0]?.message, "Partial\n");
});

test("replay recording reports histories it cannot reproduce", async (t) => {
  const root = await repository(t);
  const baseline = (await git(root, ["rev-parse", "HEAD"])).trim();
  assert.deepEqual(await recordWorkspaceCommits(root, baseline), {
    kind: "workspace-commits",
    baseline: {
      commit: baseline,
      tree: (await git(root, ["rev-parse", "HEAD^{tree}"])).trim(),
    },
    commits: [],
  });

  await git(root, ["checkout", "-b", "side"]);
  await writeFile(join(root, "side.txt"), "side\n");
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Side"]);
  await git(root, ["checkout", "main"]);
  await writeFile(join(root, "main.txt"), "main\n");
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Main"]);
  await git(root, ["merge", "--no-edit", "side"]);
  const merged = await recordWorkspaceCommits(root, baseline);
  assert.ok("unavailable" in merged);
  assert.match(merged.unavailable, /not a linear descendant/);

  const merge = (await git(root, ["rev-parse", "HEAD"])).trim();
  await git(root, ["reset", "--hard", baseline]);
  const rewritten = await recordWorkspaceCommits(root, merge);
  assert.ok("unavailable" in rewritten);
  assert.match(rewritten.unavailable, /does not end at the workspace HEAD/);

  await writeFile(join(root, "large.txt"), randomBytes(4096).toString("hex"));
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Large"]);
  const large = await recordWorkspaceCommits(root, baseline, undefined, 1024);
  assert.ok("unavailable" in large);
  assert.match(large.unavailable, /exceed 1024 bytes/);

  await git(root, ["reset", "--hard", baseline]);
  await writeFile(join(root, "latin.txt"), "latin\n");
  await git(root, ["add", "."]);
  await git(root, [
    "-c",
    "i18n.commitEncoding=ISO-8859-1",
    "commit",
    "-m",
    "Latin",
  ]);
  const encoded = await recordWorkspaceCommits(root, baseline);
  assert.ok("unavailable" in encoded);
  assert.match(encoded.unavailable, /non-UTF-8 message encoding/);

  await git(root, ["reset", "--hard", baseline]);
  await writeFile(join(root, ".gitattributes"), "*.txt diff\n");
  await writeFile(join(root, "latin.txt"), Buffer.from([0x63, 0xe9, 0x0a]));
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Latin content"]);
  const lossy = await recordWorkspaceCommits(root, baseline);
  assert.ok("unavailable" in lossy);
  assert.match(lossy.unavailable, /does not reproduce commit/);
});

test("replay recording failures become warnings and incomplete events", async (t) => {
  const root = await repository(t);
  const observations: Observation[] = [];
  const warnings: string[] = [];
  const hub = createObservationHub({
    sinks: [{ observe: (value) => void observations.push(value) }],
  });
  await recordReplayChanges(
    {
      brief: { text: "work" },
      logging: { replayable: true },
      observation: hub,
      warn: (message) => warnings.push(message),
    },
    root,
    "0".repeat(40),
  );
  await recordReplayChanges(
    { brief: { text: "work" }, logging: "stdout", observation: hub },
    root,
    "0".repeat(40),
  );
  await hub.close();
  const recordedChange = observations.find(
    (value) => value.event.kind === "workspace-commits",
  );
  assert.equal(recordedChange?.source, "git");
  assert.match(
    (recordedChange?.event as { unavailable: string }).unavailable,
    /could not be recorded/,
  );
  assert.equal(warnings.length, 1);
  assert.match(warnings[0]!, /Replay recording is incomplete/);
});
