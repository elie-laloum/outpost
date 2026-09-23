---
title: "Issue campaigns"
description: "Issue campaigns — Outpost"
sidebar:
  order: 4
---

A campaign repeatedly loads ready issues, plans branches, implements and reviews each issue, then integrates the completed work before closing tracker items.

```ts
import { campaign, codex, claude, githubBacklog } from "@elie-laloum/outpost";

const result = await campaign({
  agent: codex(),
  planner: claude(),
  reviewer: claude(),
  merger: codex(),
  backlog: githubBacklog({ label: "outpost-ready" }),
  cycles: 10,
  concurrency: 3,
  implementationPasses: 100,
  reviewPasses: 1,
  standards: "Follow project conventions, test and commit each change.",
  observe: (event) => console.log(event.phase, event.cycle, event.issue),
});
console.log(result.reason, result.issues);
```

## Roles and limits

`agent` and `backlog` are required. The other roles use the configured campaign defaults when omitted. Set `planner: false` to take ready issues in order, or `reviewer: false` to skip review. Defaults are 10 cycles, concurrency 3, 100 implementation passes and 1 review pass. Limits must be positive integers. Standard sandbox options such as provider, repository, hooks and signal are supported; the campaign owns branch/workspace allocation.

The planner must return unique assignments containing known issue IDs and valid new branch names. Invalid plans fail before implementation. Each issue owns a named workspace and one warm sandbox; review sees the full diff against the cycle base. An issue without commits is recorded as `empty` and is not closed.

## Integration and outcomes

Completed issue branches enter a separate integration sandbox, even for one issue. The merger resolves conflicts and validates combined work. Outpost checks that issue commits are ancestors of the result and that no uncommitted changes remain. Issues close only after host integration.

A failed issue is recorded while independent issues finish. Merge failures retain recovery workspaces. Tracker closure failure occurs after integration: reconcile the tracker before rerunning so merged work is not implemented again.

`reason` is `empty`, `blocked`, `no-progress` or `limit`. Issue outcomes are `empty`, `failed` or `merged`, with ID, branch and optional error. Cancellation rejects the operation. Event phases are `backlog`, `plan`, `implement`, `review`, `merge` and `close`.
