---
title: "Pause for an explicit decision"
description: "Persist an approval request and submit an explicit local decision."
---

Persist an approval request and submit an explicit local decision.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+** and npm. Start in a new directory for each example.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Save the example as **example.mts** in this directory. No account, API key or container is needed.

</details>

<!-- /preparation -->

## Try it

Save **example.mts** in `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  approvalTask,
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

const action = process.argv[2] ?? "approve";
if (action !== "approve" && action !== "reject")
  throw new Error("Use approve or reject");
const approval = approvalTask({
  key: "review",
  prompt: "Accept the text report?",
  actors: ["workshop-reader"],
});
const deliver = task({
  key: "deliver",
  after: [approval],
  perform: () => ({ delivered: true }),
});
const plan = workflow("reviewed-report", [approval, deliver]);
const checkpoint = {
  store: fileWorkflowCheckpointStore({ directory: "./state/approvals" }),
  runId: randomUUID(),
  version: "1",
};
const paused = await plan.start({ checkpoint });
assert.equal(paused.status, "paused");
const request = paused.tasks.find(
  (record) => record.key === approval.key,
)?.pause;
if (!request) throw new Error("Expected a persisted approval request");
console.log("paused", request.id);
const decided = await plan.start({
  checkpoint,
  decisions: [
    {
      executionId: paused.executionId,
      key: approval.key,
      requestId: request.id,
      action,
      actor: "workshop-reader",
      reason: "Explicit local demonstration decision",
    },
  ],
});
assert.equal(decided.status, action === "approve" ? "done" : "failed");
console.log(decided.status);
```

```sh
node example.mts
```

## Understand the result

The script prints `paused`, then `done`. Run `node example.mts reject` to see rejection prevent delivery. The example deliberately supplies a trusted local actor; actor names do not authenticate a person. In an application, authenticate the caller before submitting the decision. A paused result is expected: inspect its status before calling `unwrap()`.

[Contracts, options and edge cases](../../../reference/behavior/workflows/approvals/).

Any persisted example files remain inside this demonstration directory.
