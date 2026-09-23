---
title: "GitHub, Beads and custom backlogs"
description: "GitHub, Beads and custom backlogs — Outpost"
sidebar:
  order: 5
---

`Backlog` is the tracker port: `list(signal)`, `get(id, signal)` and `close(id, signal)`. Issues have `id`, `title`, optional `body` and optional `blockedBy` IDs. A campaign excludes issues blocked by dependencies that are still open.

## Built-in connectors

`githubBacklog({ directory, label, deadlineMs })` uses authenticated host `gh`, paginates issue pages and excludes pull requests. `label` filters the queue. Declare `GH_TOKEN` in `.outpost/.env` or authenticate the host CLI. CLI initialization with `--tracker github --label NAME` creates/updates that label.

`beadsBacklog({ directory, label, deadlineMs })` uses host `bd ready --json --limit 0`, `bd show` and `bd close`. Install and initialize [Beads](https://github.com/gastownhall/beads) first. Selecting it in initialization also adds its pinned CLI to the generated container image. Both connectors receive declared project environment values.

## Implement a backlog

```ts
import type { Backlog, Issue } from "@elie-laloum/outpost";

const issues = new Map<string, Issue>([
  ["validation", { id: "validation", title: "Add validation tests" }],
]);
const backlog: Backlog = {
  async list(signal) {
    signal?.throwIfAborted();
    return [...issues.values()];
  },
  async get(id, signal) {
    signal?.throwIfAborted();
    const issue = issues.get(id);
    if (!issue) throw new Error(`Unknown issue: ${id}`);
    return issue;
  },
  async close(id, signal) {
    signal?.throwIfAborted();
    issues.delete(id);
  },
};
console.log(await backlog.list());
```

Keep tracker mutations on the host. Agents should not close issues before integration succeeds. Make closure safe to retry when possible.

The `custom` CLI starter uses GET `issues?state=open`, GET `issues/:id`, and POST `issues/:id/close` against `OUTPOST_TRACKER_URL`. Adapt authentication, pagination and payload parsing in generated `tickets.ts`/`tickets.mts`; `.outpost/TRACKER.md` describes that starter contract.
