---
title: "Replay without a model"
description: "Record a real dispatch, then replay its events, result and commits without calling a model: to reproduce a bug or to turn a run into a deterministic test."
---

## Record a run and replay it

```ts
import {
  dispatch,
  createLocalTransport,
  readJournal,
  createReplayAgent,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const brief = { text: "Fix the failing parser test." };
const recorded = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief,
  branch: { mode: "named", name: "recorded-fix" },
  logging: { transporter, replayable: true },
});

const journal = await readJournal({
  transporter,
  reference: recorded.logReference!,
});
const replaying = createReplayAgent({ journal });
const replayed = await dispatch({
  repository,
  sandboxProvider,
  agent: replaying,
  brief,
  branch: { mode: "named", name: "replayed-fix" },
});
console.log(replayed.commits, replaying.remainingTurns); // same commits, 0
```

The first dispatch calls the model and writes a [journal](../journals/). The second replays that journal: same events, text, usage and commits, no tokens.

Both branches start from the same commit, so the replayed commits have the same ids as the recorded ones. From another commit with the same tree, trees and messages match but ids differ.

## Record a replayable run

`logging: { replayable: true }` adds a `workspace-commits` event to the journal when a sandbox dispatch ends, including a failed or cancelled one.

| Field                               | Holds                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `baseline`                          | The commit and tree the workspace started from.                        |
| `commits[].author`, `.committer`    | Name, email and date of each identity.                                 |
| `commits[].message`                 | The exact commit message.                                              |
| `commits[].patch`, `commits[].tree` | A binary Git patch, checked against the commit's tree while recording. |

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

<!-- flow -->

1. **Check**: Before each turn.
   - **Compare the prompt**: The rendered prompt must equal the recorded one.
2. **Re-emit**: Instead of calling a model.
   - **Replay the events**: Agent or harness events, then the recorded text and usage. A `verbose` journal also replays raw lines and deltas.
     - `observe`
3. **Rebuild**: On the last turn of the dispatch.
   - **Check the baseline**: The workspace tree must match the recorded baseline.
     - sandbox
   - **Apply each patch**: `git apply --index`, then compare the resulting tree.
     - sandbox
   - **Recreate the commit**: With the recorded identities, dates and message.
     - sandbox
4. **Finish**: Like the recorded turn.
   - **Rethrow the failure**: A turn that failed when recorded throws its error code and message.
   - **Return the result**: Otherwise the dispatch returns the recorded text, usage and commits.

Commits are rebuilt through the sandbox, so replays work with cloud sandboxes too. The sandbox needs `git`.

## Replay repairs, passes and fallbacks

Typed-response repairs and extra `passes` replay as separate turns. `replaying.remainingTurns` counts the turns left; a replay agent is single-use, so create a new one per replay.

A [fallback agent](../fallback-agents/) handover replays in the same turn: the stopped candidate's events, the `fallback` event, then the next candidate's turn. The next candidate's prompt is not compared, since it restarted from the original brief. The result holds the selected candidate's text, every candidate's commits and their combined usage, but no `result.fallback`.

## Handle divergences

When the replay differs from its journal, it throws [`ReplayDivergence`](../../reference/replaydivergence/), an `OutpostError` with code `replay`.

| `kind`       | Cause                                                            |
| ------------ | ---------------------------------------------------------------- |
| `prompt`     | The rendered prompt differs from the recorded prompt.            |
| `baseline`   | The workspace starts from a different tree.                      |
| `tree`       | A patch does not apply, or produces a different tree.            |
| `exhausted`  | The dispatch asks for more turns than the journal holds.         |
| `unrecorded` | The journal has no workspace commits, or they are `unavailable`. |

```ts
import {
  dispatch,
  createReplayAgent,
  ReplayDivergence,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

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
}
```

`turn`, `expected`, `actual` and `commit` locate the difference. `divergence: "warn"` turns `prompt`, `baseline`, `tree` and `unrecorded` differences into warnings and keeps going. A patch that does not apply and an exhausted journal still throw.

With `warn`, a journal recorded without `replayable` replays its events without commits.

## Replay a brief that names its branch

A brief that uses `{{WORK_BRANCH}}` puts the branch name in the prompt. An `integrate` branch gets a new generated name on each run, so its prompt never matches.

Replay on a `named` branch with the recorded name, deleted beforehand so it starts from the baseline again, or replay with `divergence: "warn"`.

## Turn a run into a test

Save the journal once to `fixtures/parser-fix.json` with `JSON.stringify(journal)`, and tag the commit the recorded branch started from `parser-fix-base`. The test replays it on a fresh branch from that tag.

```ts title="parser-fix.test.mts"
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createReplayAgent, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

test("the parser fix replays", async () => {
  const journal = JSON.parse(
    await readFile("fixtures/parser-fix.json", "utf8"),
  );
  const agent = createReplayAgent({ journal });
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent,
    brief: { text: "Fix the failing parser test." },
    branch: {
      mode: "named",
      name: `replay/${randomUUID()}`,
      from: "parser-fix-base",
    },
  });
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
