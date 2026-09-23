---
title: "Independent investigations in parallel"
description: "Independent investigations in parallel — Outpost"
sidebar:
  order: 4
---

Use this for tasks that do not depend on each other’s edits. Each receives its own branch, worktree and sandbox. Complete the [shared setup](../); ensure the machine and account support two concurrent agents.

```ts
import { isolatedTask, workflow, claude } from "@elie-laloum/outpost";

const run = Date.now().toString(36);
const topics = ["dependency risks", "missing parser tests"];
const investigations = topics.map((topic, index) =>
  isolatedTask({
    key: "audit-" + index,
    request: () => ({
      agent: claude(),
      branch: { mode: "named", name: "audit/" + run + "-" + index },
      brief: {
        text:
          "Investigate " +
          topic +
          ". Do not edit. Return a report with evidence.",
      },
      deadlineMs: 180_000,
    }),
  }),
);
const result = await workflow("independent-audits", investigations).start({
  concurrency: 2,
  stopOnError: false,
});
for (const item of investigations) {
  const record = result.tasks.find((record) => record.key === item.key);
  if (record?.status === "done") console.log(item.key, result.value(item).text);
}
result.unwrap();
```

## Isolation

Concurrent jobs must not mutate one shared checkout. Unique branch names avoid ownership conflicts. This recipe does not integrate branches. Lower concurrency if account quotas or machine resources are insufficient.

## Partial failures

With **stopOnError: false**, independent work can finish after another task fails. Read only successful task values, then call **unwrap()** to signal overall failure. Avoid automatic retries of agents until repeated external/filesystem effects are understood.
