import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  dispatch,
  createFallbackAgent,
  quotaFault,
  readJournal,
  createReplayAgent,
} from "../../src/index.ts";
import type {
  AgentObservation,
  CliAgent,
  TransportReference,
} from "../../src/index.ts";
import { recoveryDetails } from "../../src/domain/errors.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repositoryTransport } from "../../src/infrastructure/repository-transport.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted } from "../helpers.ts";

const line = (event: object) =>
  `console.log(${JSON.stringify(JSON.stringify(event))});`;

const commit = (file: string) =>
  `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process';
writeFileSync('${file}','${file}\\n'); execFileSync('git',['add','.']); execFileSync('git',['commit','-m','Add ${file}']);`;

const limited = `${line({ kind: "usage", tokens: { input: 10, cached: 0, output: 5 } })}${line({ kind: "quota", message: "limit", resetAt: "2026-10-01T00:00:00.000Z" })}${line({ kind: "failure", message: "usage limit reached" })}process.exit(1);`;

function candidate(name: string, script: string): CliAgent {
  return {
    ...scripted(script),
    name,
    quota: (text) => /usage limit/.test(text),
  };
}

async function journal(root: string, reference: unknown) {
  assert.ok(reference);
  return readJournal({
    transporter: repositoryTransport(root),
    reference: reference as TransportReference,
  });
}

const run = (
  root: string,
  agent: Parameters<typeof dispatch>[0]["agent"],
  events: AgentObservation[],
) =>
  dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    brief: { text: "work" },
    logging: { replayable: true },
    observe: (event) => events.push(event),
  });

test("replay reproduces a fallback handover, its commits and its usage", async (t) => {
  const root = await repository(t);
  const baseline = (await git(root, ["rev-parse", "HEAD"])).trim();
  const coder = createFallbackAgent(
    [
      candidate("primary", `${commit("draft.txt")}${limited}`),
      candidate(
        "backup",
        `${commit("final.txt")}${line({ kind: "usage", tokens: { input: 3, cached: 0, output: 2 } })}${line({ kind: "text", text: "done" })}`,
      ),
    ],
    { on: ["quota"] },
  );
  const recordedEvents: AgentObservation[] = [];
  const recorded = await run(root, coder, recordedEvents);
  assert.equal(recorded.fallback?.selected.name, "backup");

  const replaying = createReplayAgent({
    journal: await journal(root, recorded.logReference),
  });
  assert.equal(replaying.turns.length, 2);
  assert.deepEqual(replaying.turns[0]!.handover?.to, {
    index: 1,
    name: "backup",
  });
  assert.equal(replaying.turns[0]!.failure, undefined);
  assert.deepEqual(replaying.turns[0]!.usage, {
    input: 10,
    cached: 0,
    output: 5,
  });

  await git(root, ["reset", "--hard", baseline]);
  const events: AgentObservation[] = [];
  const replayed = await run(root, replaying, events);
  assert.equal(replaying.remainingTurns, 0);
  assert.equal(replayed.text, recorded.text);
  assert.deepEqual(replayed.usage, recorded.usage);
  assert.deepEqual(replayed.commits, recorded.commits);
  assert.equal(
    await readFile(join(replayed.directory, "draft.txt"), "utf8"),
    "draft.txt\n",
  );
  const handover = events.find((event) => event.kind === "fallback");
  assert.ok(handover?.kind === "fallback");
  assert.equal(handover.failure, "quota");
  assert.equal(handover.message, "usage limit reached");
  const texts = (list: AgentObservation[]) =>
    list.flatMap((event) => (event.kind === "text" ? [event.text] : []));
  assert.deepEqual(texts(events), texts(recordedEvents));
});

test("replay rethrows the final quota when every recorded candidate hit a limit", async (t) => {
  const root = await repository(t);
  const coder = createFallbackAgent(
    [candidate("primary", limited), candidate("backup", limited)],
    { on: ["quota"] },
  );
  let reference: unknown;
  await assert.rejects(run(root, coder, []), (error) => {
    reference = recoveryDetails(error)?.logReference;
    return quotaFault(error) !== undefined;
  });
  const replaying = createReplayAgent({
    journal: await journal(root, reference),
  });
  assert.equal(replaying.turns[0]!.handover?.failure, "quota");
  assert.equal(replaying.turns[1]!.failure?.code, "quota");
  await assert.rejects(
    run(root, replaying, []),
    (error) => quotaFault(error) !== undefined,
  );
});

test("replay rejects malformed recorded handovers", () => {
  const prompt = { kind: "prompt", text: "work", source: "agent" };
  for (const handover of [
    {
      failure: "timeout",
      from: { index: 0, name: "a" },
      to: { index: 1, name: "b" },
    },
    {
      failure: "quota",
      from: { index: -1, name: "a" },
      to: { index: 1, name: "b" },
    },
    { failure: "quota", from: { index: 0, name: "a" }, to: "b" },
  ])
    assert.throws(
      () =>
        createReplayAgent({
          journal: [
            prompt,
            {
              kind: "fallback",
              message: "limit",
              source: "agent",
              ...handover,
            },
          ],
        }),
      /Replay journal entry 1/,
    );
});
