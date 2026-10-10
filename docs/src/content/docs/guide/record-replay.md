---
title: "Replay a recorded run"
description: "Replay a journal and its recorded commits without sending a model request."
---

Keep the starting Git commit and a replayable journal from the original task. Replay can reproduce recorded commits without a model call; it cannot recreate uncommitted edits or arbitrary external effects. For new workflow tests, also consider the [offline test kit](../testing-workflows/).

## Record a run and replay it

Record a dispatch in a [journal](../journals/), then use a replay agent to reproduce its events and recorded commits. The replay sends no model requests; its usage fields reproduce the original counters rather than new consumption.

<!-- tabs -->

```ts title="record-settings.ts"
import { createLocalTransport } from "@elie-laloum/outpost";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
export const brief = { text: "Fix the failing parser test." };
```

```ts title="record.ts"
import { writeFile } from "node:fs/promises";
import { dispatch, readJournal } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { brief, transporter } from "./record-settings.ts";

export const recorded = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief,
  branch: { mode: "named", name: "recorded-fix" },
  logging: { transporter, replayable: true },
});
export const journal = await readJournal({
  transporter,
  reference: recorded.logReference!,
});
await writeFile("recorded-journal.json", JSON.stringify(journal));
```

```ts title="replay.ts"
import { createReplayAgent, dispatch } from "@elie-laloum/outpost";
import { readFile } from "node:fs/promises";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { brief } from "./record-settings.ts";

const journal = JSON.parse(await readFile("recorded-journal.json", "utf8"));
export const replaying = createReplayAgent({ journal });
export const replayed = await dispatch({
  repository,
  sandboxProvider,
  agent: replaying,
  brief,
  branch: { mode: "named", name: "replayed-fix" },
});
console.log(replayed.commits, replaying.remainingTurns);
// Example output: [ { oid: '8f3a21c…', subject: 'Fix the failing test' } ] 0
```

Run `node record.ts` once. Then `node replay.ts` reads `recorded-journal.json` from the same directory without importing the recording script. Keep the starting commit unchanged between the two commands.

Both branches start from the same commit, so the replayed commits have the same ids as the recorded ones. From another commit with the same tree, trees and messages match but ids differ.

## Record a replayable run

`logging: { replayable: true }` adds a `workspace-commits` event to the journal when a sandbox dispatch ends, including a failed or cancelled one.

API reference: [WorkspaceCommitsEvent](../../reference/workspacecommitsevent/).

:::caution
Patches put repository content in the journal. Store and share replayable journals like the code itself.
:::

When the history cannot be recorded, the event keeps the baseline, gives the reason in `unavailable`, and the dispatch emits a warning. The dispatch outcome never changes. This happens with:

- merge commits, or a history rewritten from the baseline;
- more than 8 MiB of patches and messages;
- a commit message in an encoding other than UTF-8;
- a patch that does not reproduce its commit's tree.

## What a replay does

Pass the journal to `createReplayAgent()` and use the result as the `agent` of a `dispatch()` with the same brief. It replays turn by turn, in recorded order.

1. Compare the rendered prompt with the recorded prompt before each turn; a mismatch refuses replay.
2. Replay recorded events, text and usage without calling a model. A verbose journal also replays raw lines and deltas.
3. On the last turn, verify the workspace baseline, apply and check each patch, then recreate commits with their recorded metadata.
4. Return the recorded result, or rethrow its recorded error code and message.

Commits are rebuilt through the sandbox, so replays work with cloud sandboxes too. The sandbox needs `git`.

## Replay repairs, passes and fallbacks

Typed-response repairs and extra `passes` replay as separate turns. `replaying.remainingTurns` counts the turns left; a replay agent is single-use, so create a new one per replay.

A [fallback agent](../fallback-agents/) handover replays in the same turn: the stopped candidate's events, the `fallback` event, then the next candidate's turn. The next candidate's prompt is not compared, since it restarted from the original brief. The result holds the selected candidate's text, every candidate's commits and their combined usage, but no `result.fallback`.

## Handle divergences

When the replay differs from its journal, it throws [`ReplayDivergence`](../../reference/replaydivergence/), an `OutpostError` with code `replay`.

API reference: [ReplayDivergenceKind](../../reference/replaydivergencekind/).

```ts
import {
  dispatch,
  createReplayAgent,
  ReplayDivergence,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
declare const journal: readonly unknown[];
try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: createReplayAgent({ journal }),
    brief: { text: "Fix the failing parser test." },
  });
} catch (error) {
  if (!(error instanceof ReplayDivergence)) throw error;
  console.log(error.kind, error.turn, error.expected, error.actual);
  // Example output: prompt 0 Expected brief Actual brief
}
```

`turn`, `expected`, `actual` and `commit` locate the difference. `divergence: "warn"` turns `prompt`, `baseline`, `tree` and `unrecorded` differences into warnings and keeps going. A patch that does not apply and an exhausted journal still throw.

With `warn`, a journal recorded without `replayable` replays its events without commits.

## Replay a brief that names its branch

A brief that uses `{{WORK_BRANCH}}` puts the branch name in the prompt. An `integrate` branch gets a new generated name on each run, so its prompt never matches.

Replay on a `named` branch with the recorded name, deleted beforehand so it starts from the baseline again, or replay with `divergence: "warn"`.

## Turn a run into a test

Save the journal once to `fixtures/parser-fix.json` with `JSON.stringify(journal)`, and tag the commit the recorded branch started from `parser-fix-base`. The test replays it on a fresh branch from that tag.

<!-- tabs -->

```ts title="replay-fixture.ts"
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

export const journal = JSON.parse(
  await readFile("fixtures/parser-fix.json", "utf8"),
);
export const branch = {
  mode: "named",
  name: `replay/${randomUUID()}`,
  from: "parser-fix-base",
} as const;
```

```ts title="replay-parser.ts"
import { createReplayAgent, dispatch } from "@elie-laloum/outpost";
import { journal, branch } from "./replay-fixture.ts";
import { repository, sandboxProvider } from "./outpost.config.ts";

export async function replayParser() {
  const agent = createReplayAgent({ journal });
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent,
    brief: { text: "Fix the failing parser test." },
    branch,
  });
  return { agent, result };
}
```

```ts title="parser-fix.test.ts"
import { test } from "node:test";
import { replayParser } from "./replay-parser.ts";
import assert from "node:assert/strict";

test("the parser fix replays", async () => {
  const { agent, result } = await replayParser();
  assert.equal(agent.remainingTurns, 0);
  assert.equal(result.commits.length, 1);
});
```

The test fails with a `ReplayDivergence` when the brief or the baseline changes. Each run leaves its `replay/…` branch behind.

## Limits

- One journal is one dispatch. A whole workflow does not replay.
- Only commits are replayed. Uncommitted changes in the worktree are not recorded.
- A replay cannot be resumed, forked or steered, and has no conversation to capture.
- Signed commits are rebuilt without their signature, so their ids differ.

API: [createReplayAgent](../../reference/createreplayagent/) · [ReplayAgent](../../reference/type-replayagent/) · [ReplayDivergence](../../reference/replaydivergence/) · [WorkspaceCommitsEvent](../../reference/workspacecommitsevent/) · [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/)
