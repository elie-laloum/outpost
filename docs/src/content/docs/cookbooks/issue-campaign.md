---
title: "A bounded issue campaign"
description: "A bounded issue campaign — Outpost"
sidebar:
  order: 6
---

Use this when you want tracker-driven implementation, integration and issue closure. Prerequisites: Claude authentication, a GitHub repository remote, host **gh** authentication and a clean integration branch. Start with one small issue labeled **outpost-ready**. Check **gh auth status** first.

```ts
import { campaign, claude, githubBacklog } from "@elie-laloum/outpost";

const result = await campaign({
  agent: claude(),
  planner: false,
  reviewer: claude(),
  merger: claude(),
  backlog: githubBacklog({ label: "outpost-ready" }),
  cycles: 1,
  concurrency: 1,
  implementationPasses: 2,
  reviewPasses: 1,
  signal: AbortSignal.timeout(1_800_000),
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
  standards:
    "Implement only the assigned issue, add regression tests, run npm test and commit. During integration run the full suite again.",
  observe: (event) => console.log(event.phase, event.issue),
});
console.log(result.reason, result.issues);
```

## Start small

One cycle and one worker keep the first run inspectable. **planner: false** uses ready-issue order. Reviewer and merger remain separate roles. Raise concurrency after observing branch independence, quotas and resource use.

## External effects

Issue commits integrate locally before the issue closes on GitHub. The recipe does not push the branch. Empty implementations do not close issues. Tracker failure after integration needs reconciliation before rerun to avoid duplicate work. Read [campaign outcomes](../../workflows/campaigns/). Host tracker credentials are separate from model credentials.
