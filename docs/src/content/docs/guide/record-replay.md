---
title: "Record and replay"
description: "Keep a real dispatch and replay it without calling a model."
---

`replayAgent()` replays a recorded dispatch journal. It is implemented but not yet released. The replay re-emits the recorded events, returns the recorded text and usage, and rebuilds the recorded commits. It never calls a model. Use it to reproduce a bug or to turn a real run into a deterministic test.

```ts
import {
  dispatch,
  localTransport,
  readJournal,
  replayAgent,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = localTransport({ directory: ".outpost/storage" });
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
const replaying = replayAgent({ journal });
const replayed = await dispatch({
  repository,
  sandboxProvider,
  agent: replaying,
  brief,
  branch: { mode: "named", name: "replayed-fix" },
});
console.log(replayed.commits, replaying.remainingTurns); // same commits, 0
```

Both named branches start from the same commit, so the replayed commits have the same IDs as the recorded ones.

## Record a replayable run

`logging.replayable` adds a `workspace-commits` event at the end of each sandbox dispatch. For each commit it stores the tree, the author and committer identities and dates, the exact message and a binary Git patch. Outpost applies each patch to a temporary index while recording, so an event with patches is known to reproduce the tree of each commit.

Recording is opt-in: these patches put repository content in the journal. Store and share replayable journals as carefully as the code itself.

Some histories are not recorded. In that case the event keeps the baseline and gives the reason in `unavailable`, and the dispatch emits a warning:

- merge commits, or a history rewritten from the baseline;
- more than 8 MiB of patches and messages;
- commits with a non-UTF-8 message encoding;
- a patch that does not reproduce its tree, for example when a repository `.gitattributes` forces a text diff on non-UTF-8 content.

A recording failure never changes the dispatch outcome. Failed and cancelled dispatches record their commits too, and `dispatch-finished` gains an `error` field with the code and message.

## What a replay does

The replay agent works turn by turn, in the order they were recorded:

1. It compares the rendered prompt with the recorded prompt.
2. It re-emits the recorded agent or harness events, keeping the harness observation source. A `verbose` journal also replays raw lines, deltas and streamed tool output.
3. On the last turn of a sandbox dispatch, it rebuilds the commits inside the sandbox. It checks the baseline tree, applies each patch with `git apply --index` and compares the resulting tree. Then it recreates the commit with the recorded identities and message. This goes through the sandbox, so it also works with remote providers.
4. When the recorded turn failed, it rethrows the recorded error code and message after replaying its events and commits.

Structured-response repairs and multiple passes are replayed turn by turn. The usage reported is the recorded usage; no tokens are consumed. A replay agent is single-use: `remainingTurns` counts the turns still to replay. Build a new one for each replay.

The workspace needs `git`, like any agent that commits. With the same baseline commit, the replayed commit IDs are identical. From another commit with the same tree, the trees and messages are the same and the IDs differ. Signed commits are rebuilt without their signature.

## Divergences

When the replay differs from its journal, it throws `ReplayDivergence`, an `OutpostError` with code `replay`:

| `kind`       | Cause                                                             |
| ------------ | ----------------------------------------------------------------- |
| `prompt`     | The rendered prompt differs from the recorded prompt.             |
| `baseline`   | The sandbox starts from a different tree.                         |
| `tree`       | A patch does not apply, or it produces a different tree.          |
| `exhausted`  | The dispatch asks for more turns than the journal contains.       |
| `unrecorded` | The journal has no workspace commits, or they were `unavailable`. |

`turn`, `expected`, `actual` and `commit` locate the difference. `divergence: "warn"` turns `prompt`, `baseline`, `tree` and `unrecorded` differences into warnings and keeps going. A patch that does not apply and an exhausted journal still fail. With `warn`, a journal recorded without `replayable` replays its events without commits.

```ts
import { dispatch, replayAgent, ReplayDivergence } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

declare const journal: readonly unknown[];
try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: replayAgent({ journal }),
    brief: { text: "Fix the failing parser test." },
  });
} catch (error) {
  if (!(error instanceof ReplayDivergence)) throw error;
  console.log(error.kind, error.turn, error.expected, error.actual);
}
```

A brief that uses `{{WORK_BRANCH}}` renders a different prompt on each run. Replay it with `divergence: "warn"`.

## Limits

- One journal is one dispatch. Replaying a whole workflow is out of scope.
- Only commits are replayed. Changes left uncommitted in the worktree are not recorded.
- A replay cannot be resumed or forked, and it has no conversation to capture.

API: [replayAgent](../../reference/replayagent/) · [ReplayAgent](../../reference/type-replayagent/) · [ReplayDivergence](../../reference/replaydivergence/) · [WorkspaceCommitsEvent](../../reference/workspacecommitsevent/) · [Logging](../../reference/logging/).
